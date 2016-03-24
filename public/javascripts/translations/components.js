(function() {

  var app = angular.module('translator');

  function TranslationsListController($scope, $element, $attrs) {
    var ctrl = this;
  }

  app.component('translationsList', {
    templateUrl: "tplTranslationsList",
    controller: TranslationsListController,
    bindings: {
      "translations": "="
    }
  });

  app.component('loading', {
    bindings: {
      "active": "="
    },
    template: "" +
      "<div ng-show='$ctrl.active'>" +
      "  <p align='center'><i class='fa fa-spin fa-spinner fa-4x'></i></p>" +
      "</div>"
  });

})();