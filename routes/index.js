var express = require('express');
var router = express.Router();
var api = require("./api.js");

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {
    title: 'Welcome to translator'
  });
});

router.get('/translate', function(req, res, next) {

  res.render('translate', {
    local_scripts: [
      '/javascripts/translations/translator.js',
      '/javascripts/translations/loading_service.js',
      '/javascripts/translations/translation_service.js',
      '/javascripts/translations/modal_service.js',
      '/javascripts/translations/directives.js',
      '/javascripts/translations/components.js'
    ]
  });

});

router.get('/dotest', function(req, res, next) {
  res.render('dotest', {
    title: "Test yourself!",
    backMode: false,
    local_scripts: [
      '/javascripts/testing/testing.js',
      '/javascripts/testing/testing_service.js'
    ]
  });
});

router.get('/dobacktest', function(req, res, next) {
  res.render('dotest', {
    title: "Test yourself!",
    backMode: "true",
    local_scripts: [
      '/javascripts/testing/testing.js',
      '/javascripts/testing/testing_service.js'
    ]
  });
});

router.use('/api', api);

module.exports = router;
