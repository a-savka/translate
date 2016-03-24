var url = require('url');
var request = require('request');
var key = "trnsl.1.1.20160123T071304Z.26374f6d3b8aeaad.d0432de1b65a5ea05748c4401fb2376b99a1f5ab";
var utilities = require('./../utilities.js');

var request = utilities.promisify(request);

module.exports = function translate(source) {

  var requestUrl = url.format({
    protocol: "https",
    host: "translate.yandex.net",
    pathname: "/api/v1.5/tr.json/translate",
    query: {
      key: key,
      text: source,
      lang: "en-ru"
    }
  });

  return request(requestUrl).then(function(params) {
    try {
      return JSON.parse(params[1]);
    }
    catch(e) {
      throw(e.message);
    }
  }).catch(function(err) {
    throw(new Error("Error connecting to remote translate service"));
  });

};