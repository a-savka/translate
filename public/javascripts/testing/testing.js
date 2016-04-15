var app = angular.module("testing", ["ngAnimate", "ui.bootstrap"]);

angular.bootstrap().invoke(['$http', '$q', function($http, $q) {
  var preloads = [];

  preloads.push($http.get('/api/testing/config')
    .then(function(res) {
      app.constant("config", res.data);
    })
  );

  preloads.push($http.get('/api/testing/getwords')
    .then(function(res) {
      app.value("words", res.data);
    })
  );

  $q.all(preloads).then(function() {
    angular.bootstrap(document.getElementById("testingApp"), ['testing']);
  });

}]);




app.controller("MainCtrl", ["$scope", "testingService", "$timeout", function($scope, testingService, $timeout) {

  $scope.index = 0;
  $scope.correctAnswers = 0;
  $scope.answers = null;
  $scope.isCorrect = null;

  $scope.state = ''; // Q - Show Question, A - Show Answer, F - Finished

  $scope.showQuestion = function() {
    $scope.isCorrect = null;
    $scope.answers = testingService.getAnswers($scope.index, $scope.backMode);
    $scope.state = 'Q';
  };

  $scope.getCurrentText = function() {
    return $scope.backMode ? testingService.getBackText($scope.index) : testingService.getText($scope.index);
  };

  $scope.isInState = function(s) {
    return $scope.state === s;
  };

  $scope.testingCompleted = function() {
    return $scope.isInState('F');
  };

  $scope.doAnswer = function() {
    if($scope.isCorrect) {
      $scope.correctAnswers++;
    }
    testingService.saveTestcaseResult($scope.index, $scope.isCorrect);
    $scope.state = "A";
  };

  $scope.goNext = function() {
    $scope.index++;
    if($scope.index >= testingService.getWordsLength()) {
      $scope.state = 'F';
    }
    else {
      $scope.showQuestion();
    }
  };

  $scope.anyOptionSelected = function() {
    return $scope.isCorrect !== null;
  };

  $scope.setCorrect = function(c) {
    $scope.isCorrect = c;
  };

  $scope.getWords = function() {
    return testingService.getWords();
  };

  $scope.getAnswerClass = function(a) {
    if(a.correct && $scope.isInState('A')) {
      return $scope.isCorrect ? "has-success" : "has-error";
    }
    return "";
  };

  $scope.getLabelClass = function() {
    if($scope.isInState('A')) {
      return $scope.isCorrect ? "label label-success" : "label label-danger";
    }
    return "label label-default";
  };

  $timeout(function() {
    $scope.showQuestion();
  }, 0);

}]);