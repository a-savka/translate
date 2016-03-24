var Promise = require('bluebird');
var _ = require("lodash");


function _createNestedArrays(count) {
  return _.times(count, _.ary(Array, 0));
}

function _divide(elements, size) {
  return elements.reduce(function(res, elem, idx) {
    res[idx % res.length].push(elem);
    return res;
  }, _createNestedArrays(size));
}

function _eachSeriesLimited(elements, runner, limit) {
  return Promise.all(_divide(elements, limit).map(_.ary(_.partialRight(Promise.mapSeries, runner), 1)));
}

module.exports = {
  eachSeriesLimited: _eachSeriesLimited
};