const gulp = require('gulp');
const gulpLoadPlugins = require('gulp-load-plugins');
const browserSync = require('browser-sync').create();
const del = require('del');
const wiredep = require('wiredep').stream;
const runSequence = require('run-sequence');
const exec = require('child_process').exec;
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const babelify = require('babelify');
const history = require('connect-history-api-fallback');
const wait = require('gulp-wait');

const file = require('gulp-file');
const modernizr = require('modernizr');

const babelConfig = JSON.parse(require('fs').readFileSync('./.babelrc',{encoding: 'utf-8'}));

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

gulp.task('reload', function () {
  reload({
    stream: true
  })
});

gulp.task('wait-250', function() {
  return gulp.src('')
    .pipe(wait(250))
});

gulp.task('wait-500', function() {
  return gulp.src('')
    .pipe(wait(500))
});

gulp.task('wait-1000', function() {
  return gulp.src('')
    .pipe(wait(1000))
});

gulp.task('wait-2000', function() {
  return gulp.src('')
    .pipe(wait(2000))
});

gulp.task('wait-3000', function() {
  return gulp.src('')
    .pipe(wait(3000))
});

gulp.task('styles', () => {
  gulp.src('app/styles/main.scss')
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

// Convert to ES5 for all file in Components folder
gulp.task('babel', () => {
  return gulp.src('app/graphs/**/*.js')
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe($.babel())
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest('.tmp/graphs'))
  // .pipe(reload({stream: true})); // We have the reload in 'scripts' task already
});

// Browserify for the main.js and the folder 'scripts'
gulp.task('scripts', ['babel'], () => {
  return browserify({
    entries: ['./app/scripts/main.js'],
    extensions: ['.js'],
    // Enable SourceMap
    debug: true
  })
    .transform(babelify,babelConfig)
    .bundle()
    // Prevent error interrupt Gulp streams by catching it and force to end this stream
    .on('error', function (err) {
      console.log(err);
      this.emit('end');
    })
    .pipe(source('bundle.js'))
    .pipe(gulp.dest('.tmp/scripts'))
    .pipe(reload({
      stream: true
    }));
});


function lint(files, options) {
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

gulp.task('lint', () => {
  return lint('app/scripts/**/*.js')
    .pipe(gulp.dest('app/scripts'));
});
gulp.task('lint:test', () => {
  return lint('test/spec/**/*.js')
    .pipe(gulp.dest('test/spec'));
});

gulp.task('html-optimizing',() => {
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

gulp.task('html', ()=>{
  return new Promise(resolve => {
    runSequence('styles', 'scripts','html-optimizing',resolve);
  })
});

gulp.task('images', () => {
  return gulp.src('app/assets/images/**/*')
    .pipe($.cache($.imagemin()))
    .pipe(gulp.dest('dist/assets/images'));
});

gulp.task('fonts', () => {
  return gulp.src('app/assets/fonts/**/*')
    .pipe($.if(dev, gulp.dest('.tmp/assets/fonts'), gulp.dest('dist/assets/fonts')));
});

gulp.task('extras', () => {
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

gulp.task('clean', del.bind(null, ['.tmp', 'dist']));

gulp.task('serve', () => {
  runSequence('clean', 'wait-250', 'modernizr', 'wiredep', 'wait-250', 'styles' , 'scripts' , 'fonts', () => {
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
          '/bower_components': 'bower_components',
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

    gulp.watch('app/styles/**/*.scss', ['styles']);
    gulp.watch('app/graphs/**/*.scss', ['styles']);
    gulp.watch([
      'app/scripts/**/*.js',
      'app/graphs/**/*.js',
      'app/**/*.json'
    ], ['scripts']);
    gulp.watch('app/fonts/**/*', ['fonts']);
    gulp.watch('bower.json', ['wiredep', 'fonts']);
  });
});

gulp.task('serve:dist', ['default'], () => {
  browserSync.init({
    notify: false,
    port: 9000,
    browser: browsers,
    cors: true,
    server: {
      baseDir: ['dist'],
      middleware: [
        history({})
      ],
    }
  });
});

gulp.task('serve:test', ['scripts'], () => {
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
        '/bower_components': 'bower_components',
        '/node_modules': 'node_modules'
      }
    }
  });

  gulp.watch('app/scripts/**/*.js', ['scripts']);
  gulp.watch(['test/spec/**/*.js', 'test/index.html']).on('change', reload);
  gulp.watch('test/spec/**/*.js', ['lint:test']);
});

// Build Custom Modernizr
gulp.task('modernizr',()=>{
  return new Promise(resolve => {
    modernizr.build({},result => {
      gulp.src('Modernizr Output').pipe(file('modernizr.js',result)).pipe(gulp.dest('.tmp/scripts'));
      resolve();
    });
  })
});

// inject bower components
gulp.task('wiredep', () => {
  gulp.src('app/styles/*.scss')
    .pipe($.filter(file => file.stat && file.stat.size))
    .pipe(wiredep({
      ignorePath: /^(\.\.\/)+/
    }))
    .pipe(gulp.dest('app/styles'));

  gulp.src('app/*.html')
    .pipe(wiredep({
      exclude: ['bootstrap-sass'],
      ignorePath: /^(\.\.\/)*\.\./
    }))
    .pipe(gulp.dest('app'));
});

gulp.task('gzip', [], () => {
  return gulp.src('dist/**/*.*(html|js|css|svg|json)')
    .pipe($.gzip())
    .pipe(gulp.dest('dist'))
});


gulp.task('build', ['lint', 'html', 'images', 'fonts', 'extras'], () => {
  return gulp.src('dist/**/*').pipe($.size({title: 'build', gzip: true}));
});

gulp.task('report',()=>{
  return gulp.src('dist/**/*').pipe($.size({
    title: 'BUILD: ',
    gzip: true
  }));
});

gulp.task('default', () => {
  return new Promise(resolve => {
    dev = false;
    runSequence('clean', 'wait-250', 'modernizr', 'wiredep', 'wait-250', 'build', 'gzip', resolve);
  });
});

gulp.task('parser', (cb) => {
  if (exec) {
    exec(
      'node ./node_modules/babel-cli/bin/babel-node.js ./parser/parser.js --AU --NZ',
      {
        maxBuffer: 1024 * 50000 // stdout buffer 50 Megabytes
      },
      (err, stdout, stderr) => {
      if (err || stderr) {
        throw err || stderr
      } else {
        console.log(stdout);
        cb();
      }
    });
  } else {
    throw 'Cannot exec command!'
  }
});

