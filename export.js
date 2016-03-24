var fs = require('fs');
var Promise = require('bluebird');
var writeFile = Promise.promisify(fs.writeFile);
var translationsService = require('./my_modules/services/translations_service.js');


translationsService.getAll()
  .then(saveResult)
  .then(function() {
    console.log('Export completed!');
  })
  .catch(function(err) {
    console.log(err);
  });


function saveResult(res) {
  res = JSON.stringify(res);
  return writeFile('export.json', res);
}