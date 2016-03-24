
var app = angular.module('translator', ['ngAnimate', 'ui.bootstrap']);

angular.bootstrap().invoke(['$http', function($http) {
  $http.get("/api/translations/config")
    .success(function(data, status, headers) {
      app.constant("conf", data);
      angular.bootstrap(document.getElementById("translatorApp"), ["translator"]);
    });
}]);

app.controller("MainCtrl", ['$scope', '$rootScope', 'conf', 'loadingService', 'translationService', 'modalService', function($scope, $rootScope, conf, loadingService, translationService, modalService) {

  $scope.loading = false;
  $scope.translating = false;
  $scope.source = {
    text: ""
  };

  $rootScope.$on('httpnotify:anyaction', function() {
    $scope.loading = loadingService.isUrlPendingRE("/api/translations/latest");
    $scope.translating = loadingService.isUrlPendingRE("/api/translations/translate");
  });

  $scope.loadTranslations = function() {
    translationService.loadTranslations();
  };

  $scope.getTranslateIconClass = function() {
    return $scope.translating ? "fa fa-spin fa-spinner" : "fa fa-book";
  };

  $scope.canLoadMore = function() {
    return !$scope.loading && translationService.hasMore();
  };

  $scope.getTranslations = function() {
    return translationService.getTranslations();
  };

  $scope.translate = function() {

    translationService.translate($scope.source.text)
      .then(function() {
        $scope.source.text = "";
      })
      .catch(function(message) {
        modalService.alert("Translation failed", message);
      });

  };

  $scope.canTranslate = function() {
    return !$scope.translating;
  };

  translationService.loadTranslations();

}]);
