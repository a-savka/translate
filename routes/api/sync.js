var express = require('express');
var router = express.Router();
var translationsService = require('../../my_modules/services/translations_service.js');
var fs = require('fs');


router.post("/", function(req, res, next) {
  //fs.writeFile('../translations.json', JSON.stringify(req.body.translations));
  translationsService.import(req.body.translations)
    .then(function(result) {
      res.json({message: "ok"});
    })
    .catch(function(err) {
      res.status(500).json({message: err.toString()});
    });
});

router.get("/", function(req, res, next) {
  translationsService.getAll()
    .then(function(translations) {
      res.json(translations);
    })
    .catch(function(err) {
      res.status(500).json({message: err.toString()});
    });
});

module.exports = router;