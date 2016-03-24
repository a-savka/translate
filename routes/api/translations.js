var express = require('express');
var router = express.Router();
var url = require('url');
var translationsService = require('../../my_modules/services/translations_service.js');
var config = require("../../config");


router.get("/latest", function(req, res, next) {

  var urlParsed = url.parse(req.url, true);
  var id = (typeof urlParsed.query.id !== "undefined" ? urlParsed.query.id : null);

  translationsService.getLatest(config.get('latestTranslationsCount') + 1, id)
    .then(function(translations) {
      res.json(translations);
    })
    .catch(function(err) {
      res.send(err);
    });

});

router.get("/config", function(req, res){
  res.json({
    latestTranslationsCount: config.get('latestTranslationsCount')
  });
});

router.post("/translate", function(req, res) {
  translationsService.translateText(req.body.text)
    .then(function(translateObj) {
      res.json(translateObj);
    })
    .catch(function(err) {
      res.status(206).json({message: err.message});
    });
});

router.delete("/:id", function(req, res) {
  translationsService.deleteTranslation(req.params.id)
    .then(function() {
      res.json({message: "ok"});
    })
    .catch(function(err) {
      res.json({message: err.message});
    });
});


module.exports = router;