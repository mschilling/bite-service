'use strict';

require('dotenv').config({silent: true});
const config = require('../config');
const moment = require('moment');
const api = require('../lib/bite-api');

const ref = api.getFirebaseRef();

api.archiveOrder('-KbVBOAjUsZG77unETxM')
  .then(() => {
    console.log('done!');
  });
return;
