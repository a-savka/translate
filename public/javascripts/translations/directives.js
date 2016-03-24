(function(){

  var app = angular.module('translator');

  app.directive("translationItem",['translationService', 'modalService', function(translationService, modalService) {

    return {
      restrict: "A",
      replace: true,
      scope: {
        translation: "="
      },
      templateUrl: "tplTranslationItem",
      controller: ['$scope', function($scope) {

        $scope.getRemoveButtonIconClass = function(translation) {
          return translation.pendingRequest ? "fa fa-spin fa-spinner" : "fa fa-remove";
        };

        $scope.deleteTranslation = function(_id) {
          modalService.confirm("Please Confirm", "Are you sure to delete this record?").result
            .then(function() {
              return translationService.deleteTranslation(_id);
            });
        };

      }]
    };

  }]);

})();
