var nconf = require('nconf');
var path = require('path');

nconf.argv()
  .env()
  .file({file: path.join(__dirname, 'config.json')});

nconf.set('rootpath', __dirname.split(path.sep).slice(0, -1).join(path.sep));
nconf.set('publicpath', path.join(nconf.get('rootpath'), "public"));
nconf.set('pagespath', path.join(nconf.get('rootpath'), "views", "pages"));

module.exports = nconf;