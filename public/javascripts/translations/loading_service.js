(function(app){

  app.factory('loadingService', ['$http', function($http) {

    var service = {};

    service.isUrlPending = function(url) {
      return $http.pendingRequests.some(function(req) {
        return url.toLowerCase() == req.url.toLowerCase();
      });
    };

    service.isUrlPendingRE = function(url) {
      return $http.pendingRequests.some(function(req) {
        var re = new RegExp("^" + url.toLowerCase() + ".*$");
        return re.test(req.url.toLowerCase());
      });
    };

    return service;

  }]);


  app.config(['$httpProvider', function($httpProvider) {

    $httpProvider.interceptors.push(['$rootScope', '$q', '$timeout', function($rootScope, $q, $timeout) {

      function notify() {
        $timeout(function(){
          $rootScope.$broadcast('httpnotify:anyaction');
        }, 0);
      }

      return {
        'request': function(config) {
          notify();
          return config;
        },
        'response': function(response) {
          notify();
          return response;
        },
        'requestError': function(rejection) {
          notify();
          return $q.reject(rejection);
        },
        'responseError': function(rejection) {
          notify();
          return $q.reject(rejection);
        }
      };

    }]);

  }]);


})(app);

