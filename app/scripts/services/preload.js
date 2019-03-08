const preloadService = function($rootScope,$state,$timeout,$q,$http) {
  const service = {
    fonts: function() {
      let defer = $q.defer();
      const WebFontConfig = {
        google: {
          families: ['Barlow:100,300,700'],
          timeout: 3000
        },
        class: true,
        event: true,
        loading: function() {
          console.log('Fonts loading');
        },
        active: function() {
          console.log('Fonts loaded');
          // All the css, js files is loaded, and then font is loaded
          // So the callback here is after all preload
          defer.resolve();
        },
        inactive: function() {
          console.log('Fonts failed');
          defer.reject();
        },
        fontloading: function(familyName, fvd) {
          // console.log(familyName + ' fonts are loading ' + fvd);
        },
        fontactive: function(familyName, fvd) {
          // console.log(familyName + ' fonts are actived ' + fvd);
        },
        fontinactive: function(familyName, fvd) {
          // console.log(familyName + ' fonts are inactived ' + fvd);
        }
      };
      WebFont.load(WebFontConfig);
      return defer.promise;
    },
    cacheImages: function(list,timeout = 3000,rejectWhenTimeout = false) {
      let defer = $q.defer();
      let count = 0;
      let invalidItemCount = 0;
      if (typeof list !== 'undefined') {
        if (list.length >= 1) {
          list.forEach(function(item){
            let extension = /\.(.*)$/.exec(item);
            if (extension !== null) {
              if (extension[1].toLowerCase() === 'svg') {
                $http.get(item,{
                  cache: true,
                  params: {
                    build: window._BUILD_
                  }
                }).then(function(res) {
                  count++;
                  if (count === list.length - invalidItemCount) {
                    defer.resolve();
                  }
                });
              } else {
                let newImage = new Image;
                newImage.src = item;
                newImage.onload = function() {
                  count++;
                  if (count === list.length - invalidItemCount) {
                    defer.resolve();
                  }
                }
              }
            } else {
              invalidItemCount++;
            }
          });
        }
      }
      if (timeout >= 1000) {
        $timeout(function(){
          if (rejectWhenTimeout) {
            defer.reject();
          } else {
            defer.resolve();
          }
        },timeout)
      }
      return defer.promise;
    }
  };
  return service;
};

preloadService.$inject = ['$rootScope','$state','$timeout','$q','$http'];

export default preloadService;
