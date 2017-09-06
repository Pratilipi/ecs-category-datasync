var Promise = require('bluebird');
var schemaConfig = require('./config/PratilipiSchema');
var CategoryService;
var dbUtility = require('./lib/DbUtility')({projectId: process.env.GCP_PROJ_ID, kind: 'PRATILIPI', schema: schemaConfig});
var parameterStoreAccessor = require('./helpers/ParameterStoreAccessor');

function fetchAndSyncCategoriesData(timestamp) {
  var filter = null;
  var orderBy = ['_TIMESTAMP_'];
  if(timestamp) {
    var filter = [
      ['_TIMESTAMP_', '>=', new Date(timestamp)]
    ];
  }

  dbUtility.query(filter, null, null, 5, orderBy, false)
    .then(pratilipis => {
      var addPratilipis = [];
      console.log(pratilipis.data.length, 'before filtering');

      pratilipis.data = pratilipis.data.filter((pratilipi) => {
        if(['MAGAZINE', 'BOOK'].includes(pratilipi.PRATILIPI_TYPE) && (pratilipi.SUGGESTED_TAGS || pratilipi.TAG_IDS)) {
          console.log(`[WRONG CONTENT_TYPE PRESENT] for pratilipi id ${pratilipi.PRATILIPI_ID}`);
        }
        return ['ARTICLE', 'POEM', 'STORY'].includes(pratilipi.PRATILIPI_TYPE) && ['DRAFTED', 'PUBLISHED'].includes(pratilipi.STATE) ;
      });

      console.log(pratilipis.data.length, 'after filtering');
      var data = pratilipis.data;
      for(var i = 0; i < data.length; i++) {
        var pratilipi = data[i];
        // console.log(pratilipi.PRATILIPI_ID, pratilipi.LANGUAGE, pratilipi.PRATILIPI_TYPE, pratilipi.TAG_IDS, pratilipi.SUGGESTED_TAGS);
        console.log(`[PRATILIPI_ID]: ${pratilipi.PRATILIPI_ID}`);
        addPratilipis.push(CategoryService.insertCategoriesInPratilipi(pratilipi.PRATILIPI_ID, pratilipi.LANGUAGE, pratilipi.PRATILIPI_TYPE, pratilipi.TAG_IDS, pratilipi.SUGGESTED_TAGS, pratilipi._TIMESTAMP_));
      }
      return Promise.all(addPratilipis).then(() => {
        //return maybe only timestamp and moreResults;
        return pratilipis;
      })
      .catch((err) => {
        console.log(err);
        console.log("[FAILED] Failed at this timestamp", timestamp);
        return Promise.reject();
      });
      // return pratilipis;
    })
    .then(pratilipis => {
      console.log(`${pratilipis.data.length} successfully inserted.`);
      if(pratilipis.moreResults) {
        console.log('More results exist');
        setTimeout(function () {
          fetchAndSyncCategoriesData(pratilipis.data[pratilipis.data.length - 1]._TIMESTAMP_);
        }, 3000);
      } else {
        process.exit();
      }
    })
    .catch(err => {
      console.log(err, 'Error occured. Bye bye.');
      process.exit();
    })
    ;

}

parameterStoreAccessor.getMySqlDbCredentials()
  .then(config => {
    Object.assign(process.env, config);
    var models = require('./sequelize-models');
    CategoryService = require('./Category');
    return models.sequelize.authenticate();
  })
  .then(() => {
    fetchAndSyncCategoriesData(process.env.LAST_UPDATED_TIMESTAMP);
  })
  ;
  // .then(() => {
  //   // console.log('authenticated');
  //   // CategoryService.getSystemCategories('HINDI')
  //   //   .then(results => {
  //   //     console.log(results);
  //   //     return;
  //   //   });
  //   db.sequelize.sync();
  //
  // })
  //
