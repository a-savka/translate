var Promise = require('bluebird');
var translate = require('../libs/translate.js');
var config = require("../../config");
var MongoDB = require("../../libs/promisified_mongodb.js");
var _ = require('lodash');
var chain = require("../chain.js");
var ObjectID = MongoDB.ObjectID;
var MongoClient = MongoDB.MongoClient;


function goMongo(){
  return MongoClient.connectAsync(config.get('mongoconnect'));
}

function runIf(func, condition) {
  return function() {
    return condition ? func : function() {};
  }
}

function initDb(activedb) {
  return Promise.resolve(activedb ? activedb : goMongo());
}

function getTranslation(source, activedb) {
  return initDb(activedb).then(function(db) {
    return db.collection(config.get("collectionName"))
      .findOneAsync({text: source})
      .finally(runIf(db.close, !activedb));
  });
}

function insertTranslation(translationObj, activedb) {
  return initDb(activedb)
    .then(function(db) {
      return db.collection(config.get("collectionName"))
        .insertAsync(translationObj)
        .finally(runIf(db.close, !activedb));
    })
    .then(function(){
      return translationObj;
    });

}



function updateTranslation(translationObj, activedb) {
  return initDb(activedb)
    .then(function(db) {
      return db.collection(config.get("collectionName"))
        .updateAsync(
          {
            _id: new ObjectID(translationObj._id)
          },
          translationObj
        )
        .finally(runIf(db.close, !activedb));
    })
    .then(function() {
      return translationObj;
    });
}

function increaseRequestsCount(source) {
  return goMongo().then(function(db) {
    return db.collection(config.get("collectionName"))
      .updateAsync({text: source}, {
        $inc: {
          translateRequestsCount: 1
        },
        $currentDate: {
          dateOfLastTranslate: true
        }
      })
      .finally(runIf(db.close, !activedb));
  });
}


function newTranslation(source, translate) {
  return {
    text: source,
    translate: translate,
    description: "",
    dateAdded: new Date(),
    dateOfLastTranslate: new Date(),
    translateRequestsCount: 1,
    category: "default",
    shownTimes: 0,
    correctAnswers: 0
  };
}


function getLatestCondition(db, id) {
  return function() {
    if(id){
      return db.collection(config.get("collectionName")).findOneAsync({"_id": new ObjectID(id)})
        .then(function (translation) {
          if (translation) {
            return {dateOfLastTranslate: {$lt: translation.dateOfLastTranslate}};
          }
          return {};
        });
    }
    return {};
  };
}

function getLatestItems(db, count) {
  return function(condition) {
    return db.collection(config.get("collectionName"))
      .find(condition)
      .sort({dateOfLastTranslate: -1})
      .limit(count)
      .toArrayAsync();
  };
}

function importTranslation(translation, db) {
  return getTranslation(translation.text)
    .then(function(existing){
      translation.dateAdded = new Date(translation.dateAdded);
      translation.dateOfLastTranslate = new Date(translation.dateOfLastTranslate);
      if(existing == null) {
        if(translation._id) {
          translation._id = ObjectID(translation._id);
        }
        return insertTranslation(translation, db);
      }
      if(translation.shownTimes > existing.shownTimes) {
        existing.shownTimes = translation.shownTimes;
        existing.correctAnswers = translation.correctAnswers;
      }
      if(translation.dateOfLastTranslate > existing.dateOfLastTranslate) {
        existing.dateOfLastTranslate = new Date(translation.dateOfLastTranslate);
      }
      return updateTranslation(existing, db);
    });
}

function importTranslationUsingDb(db) {
  return function(translation) {
    return importTranslation(translation, db);
  };
}


module.exports = {

  translateText: function(source) {

    return getTranslation(source).then(function(translationObj) {

      if(translationObj != null) {
        return increaseRequestsCount(source)
          .then(function() {
            return translationObj;
          });
      }

      return translate(source)
        .then(function(response) {
          return insertTranslation(newTranslation(source, response.text));
        })
        .then(function(translationObj) {
          return translationObj;
        });

    });

  },


  getLatest: function(count, id) {

    count = count || 5;

    return goMongo().then(function(db) {

      return Promise.resolve()
        .then(getLatestCondition(db, id))
        .then(getLatestItems(db, count))
        .finally(function(){
          db.close();
        });

    })
  },

  getAll: function() {
    return goMongo().then(function(db) {
      return db.collection(config.get('collectionName'))
        .find({})
        .sort({dateOfLastTranslate: -1})
        .toArrayAsync()
        .finally(function() {
          db.close()
        });
    });
  },

  deleteTranslation: function(id) {
    return goMongo().then(function (db) {
      return db.collection(config.get('collectionName'))
        .remove({
          _id: new ObjectID(id)
        });
    });
  },


  import: function(translations) {
    if(!translations.length || translations.length < 1) {
      return Promise.resolve();
    }

    return goMongo().then(function(db) {
      return chain.eachSeriesLimited(translations, importTranslationUsingDb(db), 3).finally(
        function() {
          db.close();
        }
      );
    });
  }


};