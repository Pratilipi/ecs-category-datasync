var externalEndpoints = require('./../config/ExternalEndpoints');
var AWS = require('aws-sdk');
AWS.config.update({region: 'ap-southeast-1'});
var ssm = new AWS.SSM();

module.exports = {
  getMySqlDbCredentials() {
    return new Promise(function(resolve, reject) {
      var params = {
        Names: [
          externalEndpoints.PARAMETER_STORE_MYSQL_USERNAME,
          externalEndpoints.PARAMETER_STORE_MYSQL_PASSWORD
        ],
        WithDecryption: true
      };
      var credentials = {};
      ssm.getParameters(params, function(err, data) {
        if(err) {
          reject(err.stack);
        } else {
          for(var i = 0; i < data.Parameters.length; i++) {
            if (data.Parameters[i].Name == externalEndpoints.PARAMETER_STORE_MYSQL_USERNAME) {
              credentials.MYSQL_DB_USERNAME = data.Parameters[i].Value;
            } else if (data.Parameters[i].Name == externalEndpoints.PARAMETER_STORE_MYSQL_PASSWORD) {
              credentials.MYSQL_DB_PASSWORD = data.Parameters[i].Value;
            }
          }
          resolve(credentials);
        }

      });
    });
  },
  getJarvisCredentials() {
    return new Promise(function(resolve, reject) {
      var params = {
        Names: [
          externalEndpoints.PARAMETER_STORE_JARVIS_USERNAME,
          externalEndpoints.PARAMETER_STORE_JARVIS_ATOKEN
        ],
        WithDecryption: true
      };
      var credentials = {};
      ssm.getParameters(params, function(err, data) {
        if(err) {
          reject(err.stack);
        } else {
          for(var i = 0; i < data.Parameters.length; i++) {
            if (data.Parameters[i].Name == externalEndpoints.PARAMETER_STORE_JARVIS_USERNAME) {
              credentials.JARVIS_USER_ID = data.Parameters[i].Value;
            } else if (data.Parameters[i].Name == externalEndpoints.PARAMETER_STORE_JARVIS_ATOKEN) {
              credentials.JARVIS_ATOKEN = data.Parameters[i].Value;
            }
          }
          resolve(credentials);
        }

      });
    });
  }
};
