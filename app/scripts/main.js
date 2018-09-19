import routeConfig from './routeConfig';

// Angular App Data Binding Controller
const dlApp = angular.module('dla', ['ui.router','ngAnimate','hmTouchEvents']);

// Root Controller
dlApp.controller('dlaController',['$rootScope','$scope','utilsService',function($rootScope,$scope,utilsService){
  let self = this;
  self.$onInit = function() {
    // Safari Text rendering fix
    if (utilsService.isSafari()) {
      document.querySelector('body').style['-webkit-text-stroke'] = '0.5px';
      document.querySelector('body').style['text-rendering'] = 'optimizeLegibility';
    }
  };

  self.$onChanges = function() {
    // Do Smt
  };

  self.$onDestroy = function() {
    // Do Smt
  };

  self.$postLink = function() {
    // Do Smt
  };
}]);

// Services List
import utilsService from './services/utils';
dlApp.service('utilsService',utilsService);

import preloadService from './services/preload';
dlApp.service('preloadService',preloadService);

import dataService from './services/data';
dlApp.service('dataService',dataService);

// Components List


// Layouts List


// Pages List
import dlHome from './pages/homepage';
dlApp.component('dlHome',dlHome);

// Config For Route
dlApp.config(routeConfig);

dlApp.run([
  '$rootScope',
  '$window',
  '$state',
  '$transitions',
  '$trace',
  '$timeout',
  '$sce',
  'utilsService',
  'preloadService',
  'dataService',
  dlAppRun
]);

function dlAppRun($rootScope,$window,$state,$transitions,$trace,$timeout,$sce,utilsService,preloadService,dataService) {
  // CONNECT ALL SERVICE TO ROOTSCOPE
  // use Services from anywhere in the app by $scope.$root.[Service]
  $rootScope.window = $window;
  $rootScope.state = $state;
  $rootScope.transition = $transitions;
  $rootScope.trace = $trace;
  $rootScope.timeout = $timeout;
  $rootScope.sce = $sce;
  $rootScope.utilsService = utilsService;
  $rootScope.preloadService = preloadService;
  $rootScope.dataService = dataService;

  //removeIf(production)
  // DEBUG ONLY
  $window.rootScope = $rootScope;
  $window.state = $state;
  $window.transition = $transitions;
  $window.trace = $trace;
  $window.timeout = $timeout;
  $window.sce = $sce;
  $window.utilsService = utilsService;
  $window.preloadService = preloadService;
  $window.dataService = dataService;
  //endRemoveIf(production)

  // FIRE REPORT LOG
  console.log('UP - App Started');
  //  $trace.enable('TRANSITION');
  $rootScope.stateRecords = [];
  $rootScope.transition.onCreate({},function(transition){
    // console.log('Transition Create')
    // console.log('Current from: ', transition.$from(), ' to : ', transition.$to());
  });
  $rootScope.transition.onBefore({},function(transition){
    // console.log('Transition Before')
    // console.log('Current from: ', transition.$from(), ' to : ', transition.$to());
    $rootScope.rootState = {
      lastState: {
        ...transition.$from(),
        params: {
          ...$state.params
        }
      },
      nextState: {
        ...transition.$to(),
        params: {
          ...transition.params()
        }
      }
    };
    // console.log($rootScope.rootState);
  });
  $rootScope.transition.onError({},function(transition){
    // console.log('Transition Error')
    // console.log('Current from: ', transition.$from(), ' to : ', transition.$to());
  });
  $rootScope.transition.onStart({},function(transition){
    // console.log('Transition Start',transition);
    // console.log('Current from: ', transition.$from(), ' to : ', transition.$to());
    console.log('PARAMS: ',transition.params());
    console.log('STATE: ',transition.$to().name);
  });
  $rootScope.transition.onRetain({},function(transition){
    // console.log('Transition Retain')
    // console.log('Current from: ', transition.from(), ' to : ', transition.to());
  });
  $rootScope.transition.onEnter({},function(transition){
    // console.log('Transition Enter')
    // console.log('Current from: ', transition.$from(), ' to : ', transition.$to());
    // Validate URL whether all params is valid
    // return false
  });
  $rootScope.transition.onExit({},function(transition){
    // console.log('Transition Exit')
    // console.log('Current from: ', transition.$from(), ' to : ', transition.$to());
  });
  $rootScope.transition.onFinish({},function(transition){
    // console.log('Transition Finish')
    // console.log('Current from: ', transition.$from(), ' to : ', transition.$to());
  });
  $rootScope.transition.onSuccess({},function(transition){
    // console.log('Transition Success')
    // console.log('Current from: ', transition.$from(), ' to : ', transition.$to());
    $rootScope.stateRecords.push($rootScope.rootState.currentState);
  });
}

export default dlApp;
