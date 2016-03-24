(function() {

  angular.module('translator').factory('modalService', ['$uibModal', function($uibModal) {

    function showAlert(title, message) {
      return modalInstance = $uibModal.open({
        animation: true,
        size: "xs",
        template:
        "<div class='modal-header'>" +
        "  <h4 class='modal-title warning'><i class='fa fa-warning'></i>&nbsp;<span ng-bind='title'></span></h4>" +
        "</div>" +
        "<div class='modal-body'>" +
        "  <p ng-bind='message'></p>" +
        "</div>" +
        "<div class='modal-footer'>" +
        "  <button class='btn btn-primary' type='button' ng-click='ok()'>Close</button>" +
        "</div>",
        controller: ['$scope', '$uibModalInstance', 'message', 'title', function($scope, $uibModalInstance, message, title){
          $scope.message = message;
          $scope.title = title;
          $scope.ok = function() {
            $uibModalInstance.dismiss('cancel');
          };
        }],
        resolve: {
          message: function() {return message},
          title: function() {return title}
        }
      });
    }



    function showConfirm(title, message, yesBtnCaption, noBtnCaption) {
      yesBtnCaption = yesBtnCaption || "Yes";
      noBtnCaption = noBtnCaption || "No";
      return modalInstance = $uibModal.open({
        animation: true,
        size: "xs",
        template:
        "<div class='modal-header'>" +
        "  <h4 class='modal-title warning'><i class='fa fa-warning'></i>&nbsp;<span ng-bind='title'></span></h4>" +
        "</div>" +
        "<div class='modal-body'>" +
        "  <p ng-bind='message'></p>" +
        "</div>" +
        "<div class='modal-footer'>" +
        "  <button class='btn btn-primary' type='button' ng-click='ok()'><span ng-bind='yesBtnCaption'></span></button>" +
        "  <button class='btn btn-warning' type='button' ng-click='cancel()'><span ng-bind='noBtnCaption'></span></button>" +
        "</div>",
        controller: ['$scope', '$uibModalInstance', 'message', 'title', 'yesBtnCaption', 'noBtnCaption', function($scope, $uibModalInstance, message, title, yesBtnCaption, noBtnCaption){
          $scope.message = message;
          $scope.title = title;
          $scope.yesBtnCaption = yesBtnCaption;
          $scope.noBtnCaption = noBtnCaption;
          $scope.ok = function() {
            $uibModalInstance.close('ok');
          };
          $scope.cancel = function() {
            $uibModalInstance.dismiss('cancel');
          };
        }],
        resolve: {
          message: function() {return message},
          title: function() {return title},
          yesBtnCaption: function() {return yesBtnCaption},
          noBtnCaption: function() {return noBtnCaption}
        }
      });
    }



    return {
      alert: showAlert,
      confirm: showConfirm
    };

  }]);

})();