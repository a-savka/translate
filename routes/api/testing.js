var express = require("express");
var router = express.Router();
var testBuilder = require("../../my_modules/services/test_builder_service.js");
var config = require("../../config");

router.get("/config", function(req, res, next) {
  res.json(config.get('testing'));
});

router.get("/getwords", function(req, res, next) {
  testBuilder.getTest()
    .then(function(words) {
      res.json(words);
    })
    .catch(function(err) {
      res.json({message: err.message});
    });
});

router.post("/:id", function(req, res, next) {
  testBuilder.saveTestcaseResult(req.params.id, req.body.isCorrect)
    .finally(function() {
      res.json({message: "ok"});
    });
});

module.exports = router;
