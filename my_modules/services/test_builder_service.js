var Promise = require("bluebird");
var config = require("../../config");
var MongoDB = require("../../libs/promisified_mongodb");
var MongoClient = MongoDB.MongoClient;
var ObjectID = MongoDB.ObjectID;
var _ = require("underscore");

var testingConf = config.get("testing");

var conditions = [
  { shownTimes: {$lte: testingConf.newCutoffCount} },
  { shownTimes: {$gt: testingConf.newCutoffCount, $lte: testingConf.oldCutoffCount} },
  { shownTimes: {$gt: testingConf.oldCutoffCount} }
];

var goMongo = function() {
  return MongoClient.connectAsync(config.get('mongoconnect'));
};

function getCount(condition) {
  return goMongo().then(function(db) {
    return db.collection(config.get("collectionName"))
      .aggregateAsync([
        {$match: condition},
        {$group: {
          _id: null,
          count: {$sum: 1}
        }}
      ])
      .finally(function() {
        db.close();
      })
  });
}

function getNewCount() {
  return getCount(conditions[0]);
}

function getCurrentCount() {
  return getCount(conditions[1]);
}

function getOldCount() {
  return getCount(conditions[2]);
}

function getWords(condition, count) {
  return goMongo().then(function(db) {
    return db.collection(config.get('collectionName'))
      .aggregateAsync([
        { $match: condition },
        { $sample: {size: count} }
      ])
      .finally(function() {
        db.close();
      });
  });
}

function getAvailableCounts() {
  return Promise.all([getNewCount(), getCurrentCount(), getOldCount()])
    .then(function(counts) {
      return counts.map(function(el) {
        return el.length > 0 ? el[0].count : 0;
      });
    });
}

function getCounts() {
  return getAvailableCounts()
    .then(function(counts) {
      return calculateCounts.apply(null, counts);
    });
}

function calculateCounts(cNew, cCurrent, cOld) {

  var res = [];
  var tNew = testingConf.newWordsInTest;
  var tCurrent = testingConf.midWordsInTest;
  var tOld = testingConf.oldWordsInTest;
  var tSize = tNew + tCurrent + tOld;

  res[0] = Math.max(Math.min(tNew, cNew), Math.min(tSize - (cCurrent + cOld), cNew));
  res[1] = Math.max(Math.min(tCurrent, cCurrent), Math.min(tSize - (res[0] + cOld), cCurrent));
  res[2] = Math.max(Math.min(tOld, cOld), Math.min(tSize - (res[0] + res[1]), cOld));

  return res;

}


function getTestWords(counts) {
  var words = [0,1,2].map(function(idx) {
    return getWords(conditions[idx], counts[idx]);
  });
  return Promise.all(words)
    .then(function(res) {
      return _.shuffle(res[0].concat(res[1]).concat(res[2]));
    });
}

function getTest() {
  return getCounts()
    .then(getTestWords);
}

function saveTestcaseResult(id, isCorrect) {
  isCorrect = isCorrect ? 1 : 0;
  return goMongo().then(function(db) {
    return db.collection(config.get('collectionName'))
      .updateAsync({
        _id: new ObjectID(id)
      },{
        $inc: {
          shownTimes: 1,
          correctAnswers: isCorrect
        }
      })
      .finally(function() {
        db.close();
      });
  });
}

module.exports = {
  getCounts: getCounts,
  getAvailableCounts: getAvailableCounts,
  getTest: getTest,
  saveTestcaseResult: saveTestcaseResult
};