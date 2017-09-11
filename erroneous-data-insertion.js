var Promise = require('bluebird');
var _ = require('lodash');
var schemaConfig = require('./config/PratilipiSchema');
var CategoryService;
var dbUtility = require('./lib/DbUtility')({projectId: process.env.GCP_PROJ_ID, kind: 'PRATILIPI', schema: schemaConfig});
var parameterStoreAccessor = require('./helpers/ParameterStoreAccessor');
var errorPratilipiIds = require('./config/main')[process.env.STAGE || 'local'].WRONG_P_IDS;
var chunks = _.chunk(errorPratilipiIds, 50);
var currChunkIndex = 0;
function fetchAndSyncCategoriesData(pratilipiIds) {

  dbUtility.list(pratilipiIds)
    .then(pratilipis => {
      var addPratilipis = [];
      console.log(pratilipis.length, 'before filtering');
      // pratilipis.newTimestamp = pratilipis.data[pratilipis.data.length - 1]._TIMESTAMP_;
      pratilipis = pratilipis.filter((pratilipi) => {
        if(['MAGAZINE', 'BOOK'].includes(pratilipi.PRATILIPI_TYPE) && (pratilipi.SUGGESTED_TAGS || pratilipi.TAG_IDS)) {
          console.log(`[WRONG CONTENT_TYPE PRESENT] for pratilipi id ${pratilipi.PRATILIPI_ID}`);
        }
        return ['ARTICLE', 'POEM', 'STORY'].includes(pratilipi.PRATILIPI_TYPE) && ['DRAFTED', 'PUBLISHED'].includes(pratilipi.STATE) ;
      });

      console.log(pratilipis.length, 'after filtering');
      var data = pratilipis;
      for(var i = 0; i < data.length; i++) {
        var pratilipi = data[i];
        // console.log(pratilipi.PRATILIPI_ID, pratilipi.LANGUAGE, pratilipi.PRATILIPI_TYPE, pratilipi.TAG_IDS, pratilipi.SUGGESTED_TAGS);
        console.log(`[PRATILIPI_ID]: ${pratilipi.PRATILIPI_ID}`);
        console.log(`${pratilipi.TAG_IDS} ${pratilipi.SUGGESTED_TAGS}`);
        if(pratilipi.TAG_IDS && pratilipi.TAG_IDS.length)
          console.log(typeof(pratilipi.TAG_IDS[0]));
        addPratilipis.push(CategoryService.insertCategoriesInPratilipiForErroneousData(pratilipi.PRATILIPI_ID, pratilipi.LANGUAGE, pratilipi.PRATILIPI_TYPE, pratilipi.TAG_IDS, pratilipi.SUGGESTED_TAGS, pratilipi._TIMESTAMP_));
      }
      return Promise.all(addPratilipis).then(() => {
        //return maybe only timestamp and moreResults;
        return pratilipis;
      })
      .catch((err) => {
        console.log(err);
        console.log("[FAILED] Failed ");
        return Promise.reject();
      });
      // return pratilipis;
    })
    .then(pratilipis => {
      console.log(`${pratilipis.length} successfully inserted.`);
      if(chunks[currChunkIndex]) {
        fetchAndSyncCategoriesData(chunks[currChunkIndex++]);
      } else {
        console.log('FINAL SUCCESS');
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
      fetchAndSyncCategoriesData(chunks[currChunkIndex++]);
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
