(function() {

  angular.module('translator').factory('translationService', ['$http', 'conf', '$q', function($http, conf, $q){

    var _translations = [];
    var _hasMore = true;

    function _getTranslations() {
      return _translations;
    }

    function _fHasMore() {
      return _hasMore;
    }

    function _getTranslationIndex(_id) {
      var res = -1;
      for(var idx = 0; idx < _translations.length; idx++) {
        if(_translations[idx]._id === _id) {
          res = idx;
          break;
        }
      }
      return res;
    }

    function _setPending(_id, isPending) {
      var idx = _getTranslationIndex(_id);
      if(idx != -1) {
        _translations[idx].pendingRequest = isPending;
      }
    }

    function _isPending(_id) {
      var idx = _getTranslationIndex(_id);
      return idx != -1 && _translations[idx].pendingRequest;
    }

    function _loadTranslations() {

      if(!_hasMore) {
        return $q.reject("There are no more translations");
      }

      var url = "/api/translations/latest";
      if(_translations.length > 0) {
        url += "?id=" + _translations[_translations.length - 1]._id;
      }

      return $http.get(url)
        .then(function(response) {
          if(response.data.length <= conf.latestTranslationsCount) {
            _hasMore = false;
          }
          _translations = _translations.concat(response.data.slice(0, conf.latestTranslationsCount));
          return _translations;
        });

    }

    function _deleteTranslation(_id) {

      if(_isPending(_id)) {
        return $q.reject("Pending request");
      }

      _setPending(_id, true);

      return $http.delete("/api/translations/" + _id)
        .then(function(response){
          var idx = _getTranslationIndex(_id);
          if(response.data.message == "ok") {
            _translations.splice(idx, 1);
            return "ok";
          }
          return $q.reject(response.data.message);
        })
        .finally(function() {
          _setPending(_id, false);
        });

    }


    function _translate(text) {

      if(text === "") {
        return $q.reject("Text to translate wasn't provided");
      }

      return $http.post("/api/translations/translate", {
          text: text
        })
        .then(function(response){
          if(response.status == 200) {
            _translations.unshift(response.data);
            return _translations;
          }
          return $q.reject(response.data.message);
        });

    }



    return {
      hasMore: _fHasMore,
      getTranslations: _getTranslations,
      loadTranslations: _loadTranslations,
      deleteTranslation: _deleteTranslation,
      translate: _translate
    };

  }]);

})();