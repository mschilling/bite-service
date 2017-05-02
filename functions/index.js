'use strict';

const functions = require('firebase-functions');

const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

exports.cleanupOrderData = functions.database.ref('/orders/{pushId}').onWrite(event => {
  if (event.data.exists()) {
    return;
  }
  console.info('Todo: cleanup order after deletion');
  return;
});
