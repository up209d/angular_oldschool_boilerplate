// Page List
const routeConfig = function ($stateProvider, $urlRouterProvider, $locationProvider) {

  const routes = [
    {
      name: 'root',
      abstract: true,
      resolve: {
        msg: function () {
          return 'Root Router Loaded';
        },
        preloadFont: function(preloadService) {
          return preloadService.fonts();
        },
        cacheImages: function(preloadService) {
          return preloadService.cacheImages([
            'assets/images/img_place_holder.svg'
          ]);
        },
        fetchData: function(dataService) {
          return dataService.generateData();
        },
      },
      data: {
        page: 'root'
      },
      onEnter: function () {
        console.log('All preloading assets are fetched!');
        $('#dl-preload').css({ opacity: 0, pointerEvents:'none' });
      },
      onExit: function () {
        console.log('Root Exiting ...');
      }
    },
    {
      name: 'root.home',
      url: '/home',
      resolve: {
        homeMsg: function () {
          return 'Home / ';
        }
      },
      data: {
        page: 'home'
      },
      onEnter: function () {
        console.log('Home Entering ...');
      },
      onExit: function () {
        console.log('Home Exiting ...');
      },
      params: {
        // Default params, optional params come here
      },
      views: {
        // It is better to use template and controller to put component in instead of
        // declare component directly here, since you will have an inherit resolve, data
        // and can bind data in to the component, you also have one parent controller bound to
        // the template in addition. Also you can control your template better
        // than just declare only component here
        '': {
          // template: '<h1 class="text-center p-5">HELLO WORLD</h1>',
          // controller: ['$scope',function($scope) {
          //  // Do Smt
          // }]
          // In case you want to bind something to component
          component: 'dlHome',
          // bindings: {
          //  rootMsg: 'rootMsg',
          //  homeMsg: 'homeMsg'
          // }
        }
      }
    }
  ];

  $urlRouterProvider.otherwise('/home');

  routes.forEach((route) => {
    $stateProvider.state(route);
  });

  // HTML5 Mode to remove # prefix, it depend on the config of the server that
  // all the url request in any case has to be served as the root / as a fallback
  $locationProvider
    .html5Mode(
      {
        enabled: false,
        requireBase: false
      })
    // Fallback to prefix '#' if browser doesnt support HTML5Mode
    // for exp if add '!' in so it will become '!#'
    .hashPrefix('')

};

routeConfig.$inject = ['$stateProvider', '$urlRouterProvider', '$locationProvider'];

export default routeConfig;
