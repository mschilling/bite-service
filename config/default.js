'use strict';

// More info: // REF: http://goenning.net/2016/05/13/how-i-manage-application-configuration-with-nodejs/
module.exports = {
  firebase: {
    databaseURL: '<firebase databaseUrl>',
    serviceAccount: '<path to file>'
  },
  fcm: {
    authKey: '<fcm auth key>',
    debugToken: '<fcm debug token>'
  },
  log: 'debug'
};
