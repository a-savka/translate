var express = require('express');
var router = express.Router();
var translations = require('./api/translations.js');
var testing = require('./api/testing.js');
var sync = require('./api/sync.js');

router.use('/translations', translations);
router.use('/testing', testing);
router.use('/sync', sync);

module.exports = router;