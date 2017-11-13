var pratilipiReadCountData = require('./fix_data.json');
var Promise = require('bluebird');
var http = require('http');
var httpPromise = require('request-promise');
var _ = require('lodash');
var parameterStoreAccessor = require('./../helpers/ParameterStoreAccessor');
var agent = new http.Agent({
  keepAlive : true
});

var pratilipiDataChunks = _.chunk(pratilipiReadCountData, 10);
var currChunkNo = 0;
var failedPratilipiIds = [];

startRCFix(pratilipiDataChunk) {

  var prArray = [];
  for(var i=0; i<pratilipiDataChunk.length; i++) {

    prArray.push(patchPratilipiRC(pratilipiDataChunk[i]));
  }

  Promise.all(prArray)
    .then(() => {
      console.log('Completed chunk no', currChunkNo + 1);
      if(pratilipiDataChunks[currChunkNo +1]) {
        startRCFix(pratilipiDataChunks[++currChunkNo]);
      } else {
        console.log(`[FAILED PRATILIPI IDS TOTAL AFTER SUCCESS] are ${failedPratilipiIds}`);
        process.exit();
      }

    })
}


parameterStoreAccessor.getJarvisCredentials()
  .then(config => {
    Object.assign(process.env, config);
    startRCFix(pratilipiDataChunks[currChunkNo]);
  })
  ;

function patchPratilipiRC(pratilipiObj) {
  var pratilipiPatchOptions = {
    method: 'PATCH',
    uri:  `${process.env.API_END_POINT}/pratilipis/${pratilipiObj.pratilipi_id}`,
    form: {
      readCount: pratilipiObj.new_rc
    },
    agent: agent
  };

  if(process.env.STAGE != 'devo') {
    authorFactsPatchOptions.headers = {
      'Access-Token': process.env.JARVIS_ATOKEN,
      'User-Id': process.env.JARVIS_USER_ID
    };
  }

  // console.log('Author patch request for ' + authorId + ' is ' + JSON.stringify(_.pick(authorFactsPatchOptions, ['form'])));
  return httpPromise(pratilipiPatchOptions)
    .catch((err) => {
      console.log('[ERROR RETURNED FOR] ' + pratilipiObj.pratilipi_id + ' ' + err);
      failedPratilipiIds.push(pratilipiObj.pratilipi_id);
      return;
    })
    ;
}
