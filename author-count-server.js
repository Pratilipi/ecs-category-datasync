var Promise = require('bluebird');
var http = require('http');
var httpPromise = require('request-promise');
var _ = require('lodash');
var agent = new http.Agent({
  keepAlive : true
});
var schemaConfig = require('./config/PratilipiAuthorCountSchema');
var dbUtility = require('./lib/DbUtility')({projectId: process.env.GCP_PROJ_ID, kind: 'PRATILIPI', schema: schemaConfig});

var failedAuthorIds = [];

function backfillAuthorCounts(timestamp) {
  var filter = null;
  var orderBy = ['_TIMESTAMP_'];
  if(timestamp) {
    var filter = [
      ['_TIMESTAMP_', '>=', new Date(timestamp)]
    ];
  }

  dbUtility.query(filter, null, null, 50, orderBy, false)
    .then(pratilipis => {
      var prAuthorPratilipis = [];
      var prAuthorHttpRequests = [];
      pratilipis.newTimestamp = pratilipis.data[pratilipis.data.length - 1]._TIMESTAMP_;
      pratilipis.data = pratilipis.data.filter((pratilipi) => {
        return ['DRAFTED', 'PUBLISHED', 'DELETED'].includes(pratilipi.STATE) ;
      });

      var data = pratilipis.data;
      console.log(`Before unique author ids ${data.length}`);
      var authorIds = _.uniq(_.map(data, 'AUTHOR_ID'));
      console.log(`After unique author ids ${authorIds.length}`);
      for(var i = 0; i < authorIds.length; i++) {
        var authorId = authorIds[i];
        var filter = [
          ['AUTHOR_ID', '=', authorId]
        ];
        prAuthorPratilipis.push(dbUtility.query(filter, null, null, null, null, false));
      }

      return Promise.all(prAuthorPratilipis).then((responses) => {
        //return maybe only timestamp and moreResults;
        for(var i = 0; i < responses.length; i++) {
          var authorPratilipis = responses[i].data;
          var pratilipisStateCounts = _.countBy(authorPratilipis, (pratilipi) => {
            return pratilipi.STATE;
          });

          var draftedCount = pratilipisStateCounts.DRAFTED || 0;
          var publishedCount = pratilipisStateCounts.PUBLISHED || 0;
          prAuthorHttpRequests.push(updateAuthorCounts({
            contentPublished: publishedCount,
            contentDrafted: draftedCount
           }, authorIds[i]));
        }

        return Promise.all(prAuthorHttpRequests)
          .then(() => {
            return pratilipis;
          });
      })
      .then((pratilipis) => {
        if(pratilipis.moreResults) {
          console.log(`More results exist after timestamp ${pratilipis.newTimestamp}`);
          setTimeout(function () {
            backfillAuthorCounts(pratilipis.newTimestamp);
          }, 10000);
        } else {
          console.log(`[FAILED AUTHOR IDS TOTAL AFTER SUCCESS] are ${failedAuthorIds}`);
          process.exit();
        }
      })
      .catch((err) => {
        console.log(err);
        console.log("[FAILED] Failed at this timestamp", timestamp);
        return Promise.reject();
      });
      // return pratilipis;
    })
    .catch(err => {
      console.log(err, 'Error occured. Bye bye.');
      console.log(`[FAILED AUTHOR IDS TOTAL] are ${failedAuthorIds}`);
      process.exit();
    })
    ;

}

backfillAuthorCounts(process.env.LAST_TS);

function updateAuthorCounts(body, authorId) {
  var authorFactsPatchOptions = {
    method: 'PATCH',
    uri:  `${process.env.API_END_POINT}/authors/${authorId}`,
    form: body,
    agent: agent,
    headers: { // TODO: decide what to do in this
      'Access-Token': headers.accessToken,
      'User-Id': headers.userId
    }
  };
  console.log('Author patch request for ' + authorId + ' is ' JSON.stringify(_.pick(authorFactsPatchOptions, ['form'])));
  return httpPromise(authorFactsPatchOptions)
    .catch((err) => {
      console.log('[ERROR RETURNED FOR] ' + authorId + ' ' + err);
      failedAuthorIds.push(authorId);
      return;
    })
    ;
}
