(function(app) {

  app.factory("testingService", ['$http', 'words', 'config', function($http, words, config) {


    function _getRandomInt(min, max) {
      return Math.floor(Math.random() * (max - min + 1) + min);
    }


    function _getAnswers(wIdx, backMode) {

      var _words = words.slice(0);

      var res = [];
      res.push({
        text: backMode ? words[wIdx].text : words[wIdx].translate[0],
        correct: true
      });

      _words.splice(wIdx, 1);

      while(_words.length > 0 && res.length < config.answerOptionsCount) {
        (function(idx) {
          res.push({
            text: backMode ? _words[idx].text : _words[idx].translate[0],
            correct: false
          });
          _words.splice(idx, 1);
        })(_getRandomInt(0, _words.length - 1));
      }

      return _.shuffle(res);

    }


    function _saveTestcaseResult(idx, isCorrect) {
      $http.post("/api/testing/" + words[idx]._id, {
        isCorrect: isCorrect
      });
    }


    return {

      getAnswers: _getAnswers,
      saveTestcaseResult: _saveTestcaseResult,

      getWords: function() {
        return words;
      },

      getWord: function(idx) {
        return words[idx];
      },

      getText: function(idx) {
        return words[idx] ? words[idx].text : "";
      },

      getBackText: function(idx) {
        return words[idx] ? words[idx].translate[0] : "";
      },

      getWordsLength: function() {
        return words.length;
      }

    };

  }]);


})(app);