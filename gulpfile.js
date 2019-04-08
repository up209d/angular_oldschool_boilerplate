const gulp = require('gulp');
const gulpLoadPlugins = require('gulp-load-plugins');
const browserSync = require('browser-sync').create();
const del = require('del');

const wiredepStream = require('wiredep').stream;
const exec = require('child_process').exec;
const browserify = require('browserify');
const babelify = require('babelify');
const history = require('connect-history-api-fallback');
const wait = require('gulp-wait');

const vinyl = require('vinyl');

const modernizr = require('modernizr');

const babelConfig = JSON.parse(require('fs').readFileSync('./.babelrc', {encoding: 'utf-8'}));

const $ = gulpLoadPlugins();
const reload = browserSync.reload;

let dev = true;

const isWindow = /^win/.test(process.platform);

const browsers = isWindow ? [
  'firefox'
] : [
  'google chrome',
  // 'safari',
  // 'firefox'
];

// JSLint
let lint = function (files, options) {
  return gulp.src(files)
    .pipe($.eslint({
      fix: true
    }))
    .pipe(reload({
      stream: true,
      once: true
    }))
    .pipe($.eslint.format())
    .pipe($.if(!browserSync.active, $.eslint.failAfterError()));
}

gulp.task('lint', function () {
  return lint('app/scripts/**/*.js')
    .pipe(gulp.dest('app/scripts'));
});

gulp.task('lint:test', function () {
  return lint('test/spec/**/*.js')
    .pipe(gulp.dest('test/spec'));
});

// Waiting tasks
gulp.task('wait-250', function () {
  return gulp.src('*.nothing')
    .pipe(wait(250))
});

gulp.task('wait-500', function () {
  return gulp.src('*.nothing')
    .pipe(wait(500))
});

gulp.task('wait-1000', function () {
  return gulp.src('*.nothing')
    .pipe(wait(1000))
});

gulp.task('wait-2000', function () {
  return gulp.src('*.nothing')
    .pipe(wait(2000))
});

gulp.task('wait-3000', function () {
  return gulp.src('*.nothing')
    .pipe(wait(3000))
});

// Clean dist and .tmp directory
gulp.task('clean', function () {
  return del(['.tmp', 'dist']);
});

// Gzip
gulp.task('gzip', function () {
  return gulp.src('dist/**/*.*(html|js|css|svg|json)')
    .pipe($.gzip())
    .pipe(gulp.dest('dist'))
});

// Build Custom Modernizr
gulp.task('modernizr', function () {
  return new Promise(resolve => {
    modernizr.build({}, result => {
      let file = new require('stream').Readable({objectMode: true});
      file._read = function () {
        this.push(new vinyl({
          cwd: './',
          base: './',
          path: './modernizr.js',
          contents: new Buffer.from(result)
        }));
        this.push(null);
      };
      file.pipe(gulp.dest('.tmp/scripts'));
      resolve();
    });
  })
});

// Wiredep
gulp.task('wiredep', function () {
  return gulp.src('app/styles/*.scss')
    .pipe($.filter(file => file.stat && file.stat.size))
    .pipe(wiredepStream({
      directory: './',
      bowerJson: '{}',
      ignorePath: /^(\.\.\/)+/
    }))
    .pipe(gulp.dest('app/styles'));

  gulp.src('app/*.html')
    .pipe(wiredepStream({
      directory: './',
      bowerJson: '{}',
      exclude: ['bootstrap-sass'],
      ignorePath: /^(\.\.\/)*\.\./
    }))
    .pipe(gulp.dest('app'));
});

// SCSS to CSS
gulp.task('styles', function () {
  return gulp.src('app/styles/main.scss')
    .pipe(wait(500))
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe(
      $.sass.sync({
        outputStyle: 'expanded',
        precision: 10,
        includePaths: ['.', './', './app/']
      })
        .on(
          'error',
          $.sass.logError
        )
    )
    .pipe($.autoprefixer({
      browsers: ['> 1%', 'last 2 versions', 'Firefox ESR']
    }))
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest('.tmp/styles'))
    .pipe(reload({
      stream: true
    }))
});

// Convert to ES5 for all file in others folder
// gulp.task('babel', function () {
//   return gulp.src('app/graphs/**/*.js')
//     .pipe($.plumber())
//     .pipe($.sourcemaps.init())
//     .pipe($.babel())
//     .pipe($.sourcemaps.write('.'))
//     .pipe(gulp.dest('.tmp/graphs'))
//   // .pipe(reload({stream: true})); // We have the reload in 'scripts' task already
// });

// Browserify for the main.js and the folder 'scripts'
gulp.task('scripts',
  // gulp.parallel('babel'),
  function () {
    let file = new require('stream').Readable({ objectMode: true });
    file._read = function() {
      this.push(new vinyl({
        cwd: './',
        base: './',
        path: './bundle.js',
        contents: browserify({
          entries: ['./app/scripts/main.js'],
          extensions: ['.js'],
          // Enable SourceMap
          debug: true
        })
          .transform(babelify, babelConfig)
          .bundle()
          // Prevent error interrupt Gulp streams by catching it and force to end this stream
          .on('error', function (err) {
            console.log(err);
            this.emit('end');
          })
      }));
      this.push(null);
    };

    return file
      .pipe(gulp.dest('.tmp/scripts'))
      .pipe(reload({
        stream: true
      }));
  });

// Copy Images
gulp.task('images', function () {
  return gulp.src('app/assets/images/**/*')
    .pipe($.cache($.imagemin()))
    .pipe(gulp.dest('dist/assets/images'));
});

// Copy Fonts
gulp.task('fonts', function () {
  return gulp.src('app/assets/fonts/**/*')
    .pipe($.if(dev, gulp.dest('.tmp/assets/fonts'), gulp.dest('dist/assets/fonts')));
});

// Copy other things
gulp.task('extras', function () {
  return gulp.src([
    'app/**/*.json',
    'app/**/*.html',
    'app/**/*.php',
    'app/*',
    '*api/**/*',
    '!app/*.html',
    '!app/graphs',
    '!app/styles',
    // '!app/php',
    // '!app/php/**/*.*'
  ], {
    dot: true
  }).pipe(gulp.dest('dist'));
});

// HTML for production
gulp.task('html-optimizing', function () {
  return gulp.src('app/*.html')
    .pipe($.useref({
      searchPath: ['.tmp', 'app', '.']
    }))
    .pipe(
      $.if(
        '*.js',
        $.removeCode(
          // Remove Marked Code Block from production
          // //removeIf(production)
          // ...
          // //endRemoveIf(production)
          // Or  //removeIf(!development)
          {
            production: true
          }
        )
      )
    )
    .pipe(
      $.if(
        '*.js',
        $.uglify(
          // also Remove sourceMap here
          // This also solve the angular minify problem
          {
            mangle: false,
            compress: {
              drop_console: true
            }
          }
        )
      )
    )
    .pipe($.if('*.css', $.cssnano({
      safe: true,
      autoprefixer: false
    })))
    .pipe($.if('*.js', $.rev()))
    .pipe($.if('*.css', $.rev()))
    .pipe($.revReplace())
    .pipe($.if('*.html', $.htmlmin({
      collapseWhitespace: true,
      minifyCSS: true,
      minifyJS: true
    })))
    .pipe(gulp.dest('dist'));
});

// HTML/JS/CSS build
gulp.task('html', gulp.series('styles', 'scripts', 'html-optimizing'));

// Report production build
gulp.task('report', function () {
  return gulp.src('dist/**/*').pipe($.size({
    title: 'BUILD: ',
    gzip: true
  }));
});

// Production Build - dist
gulp.task('build', gulp.series(
  gulp.parallel('lint', 'html', 'images', 'fonts', 'extras'),
  function () {
    return gulp.src('dist/**/*').pipe($.size({title: 'build', gzip: true}));
  }
));

// Set dev
gulp.task('dev:true', function (cb) {
  dev = true;
  cb();
});

gulp.task('dev:false', function (cb) {
  dev = false;
  cb();
});


// Default
gulp.task('default', gulp.series(
  'dev:false',
  'clean',
  'wait-250',
  'modernizr',
  'wiredep',
  'wait-250',
  'build',
  'gzip')
);


// Browsersync Server
gulp.task('server:dev', function (cb) {
  browserSync.init({
    notify: false,
    port: 9000,
    browser: browsers,
    cors: true,
    server: {
      baseDir: ['.tmp', 'app'],
      middleware: [
        history({})
      ],
      routes: {
        '/node_modules': 'node_modules'
      }
    }
  });

  gulp.watch([
    'app/*.html',
    'app/**/*.html',
    'app/images/**/*',
    '.tmp/fonts/**/*'
  ]).on('change', reload);

  gulp.watch('app/styles/**/*.scss', gulp.series('styles'));
  gulp.watch('app/graphs/**/*.scss', gulp.series('styles'));
  gulp.watch([
    'app/scripts/**/*.js',
    'app/graphs/**/*.js',
    'app/**/*.json'
  ], gulp.series('scripts'));

  gulp.watch('app/fonts/**/*', gulp.series('fonts'));
  cb();
});

gulp.task('server:prod', function (cb) {
  browserSync.init({
    notify: false,
    port: 9000,
    browser: browsers,
    cors: true,
    server: {
      baseDir: ['dist'],
      middleware: [
        history({})
      ]
    }
  });
  cb();
});

gulp.task('server:test', function () {
  browserSync.init({
    notify: false,
    port: 9000,
    ui: false,
    browser: browsers,
    cors: true,
    server: {
      baseDir: 'test',
      middleware: [
        history({})
      ],
      routes: {
        '/scripts': '.tmp/scripts',
        '/node_modules': 'node_modules'
      }
    }
  });

  gulp.watch('app/scripts/**/*.js', gulp.series('scripts'));
  gulp.watch(['test/spec/**/*.js', 'test/index.html']).on('change', reload);
  gulp.watch('test/spec/**/*.js', gulp.series('lint:test'));
});

// Dev build
gulp.task('serve',
  gulp.series(
    'clean',
    'wait-250',
    'modernizr',
    'wiredep',
    'wait-250',
    'styles',
    'scripts',
    'fonts',
    'server:dev'
  )
);

// Prod build with Browsersync server
gulp.task('serve:dist', gulp.series('default', 'server:prod'));

// Test
gulp.task('serve:test', gulp.series('scripts', 'server:test'));
