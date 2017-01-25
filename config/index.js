'use strict';

const _ = require('lodash');
const defaults = require('./default.js');
const config = require('./' + (process.env.NODE_ENV || 'development') + '.js');
module.exports = _.merge({}, defaults, config);

// REF: http://goenning.net/2016/05/13/how-i-manage-application-configuration-with-nodejs/
