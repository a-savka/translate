var UGLIFIED_PATH = "/javascripts/uglified";

var _ = require("underscore");

var config = require("../config");
var Promise = require("bluebird");
var uglifyJS = require("uglify-js");
var path = require("path");
var fs = require("fs");
var mkdirp = require("mkdirp");


mkdirp = Promise.promisify(mkdirp);
var writeFile = Promise.promisify(fs.writeFile);

var uglifiedPaths = {};

module.exports = function(req, res, next) {

  var oldRender = res.render;

  res.render = function(view, locals, callback) {

    var defaults = _.extendOwn({
        title: "",
        local_scripts: [],
        global_scripts: []
      },
      config.get('default_locals') || {}
    );

    var _locals = _.extendOwn(defaults, locals || {});

    prepareJS(_locals.local_scripts, UGLIFIED_PATH + req.path + ".js")
      .then(function(local_scripts) {
        _locals.local_scripts = local_scripts;
        return prepareJS(_locals.global_scripts, "/javascripts/uglified/global.js");
      })
      .then(function(global_scripts) {
        _locals.global_scripts = global_scripts;
      })
      .finally(function() {
        var args = [view, _locals];
        if(callback) {
          args.push(callback);
        }
        oldRender.apply(res, args);
      });

  };

  next();

};



function prepareJS(scripts, destinationUrl) {

  var destinationPath = path.join(config.get("publicpath"), destinationUrl);

  if(scripts.length == 0 || config.get('NODE_ENV') == 'development') {
    return Promise.resolve(scripts);
  }

  if(uglifiedPaths[destinationUrl]) {
    return Promise.resolve([destinationUrl]);
  }

  var scripts_paths = scripts.map(function(script) {
    return path.join(config.get("publicpath"), script);
  });

  var uglified = uglifyJS.minify(scripts_paths);

  return mkdirp(path.dirname(destinationPath))
    .then(function(){
      return writeFile(destinationPath, uglified.code);
    })
    .then(function() {
      uglifiedPaths[destinationUrl] = true;
      return Promise.resolve([destinationUrl]);
    })
    .catch(function() {
      return Promise.resolve([scripts]);
    });

}
