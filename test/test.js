'use strict';

require('dotenv').config({silent: true});
const config = require('../config');
const moment = require('moment');
const api = require('../lib/bite-api');

const ref = api.getFirebaseRef();

// api.archiveOrder('-KbV2SIFf4XFYd3eVMZi')
//   .then(() => {
//     console.log('done!');
//   });
// return;
