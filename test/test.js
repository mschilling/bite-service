'use strict';

require('dotenv').config({silent: true});
const config = require('../config');
const moment = require('moment');
const api = require('../lib/bite-api');

const ref = api.getFirebaseRef();

console.log(config.fcm.pushEnabled);

// api.archiveOrder('-KbUrONnao3Y7a6KmY_z')
//   .then(() => {
//     console.log('done!');
//   });
return;

ref.child('orders').on('child_added', (snapshot) => {
  console.log(`Order ${snapshot.key} added`);
  snapshot.ref.child('action').on('value', onOrderActionChanged);
});

function onOrderActionChanged(snapshot) {
  const orderId = snapshot.ref.parent.key;
  // console.log(`Order status ${orderId} set to ${snapshot.val()}`);
  switch (snapshot.val()) {
    case 'new':
      snapshot.ref.set('open');
      notifyBiteIsOpen(orderId);
      break;
    case 'closed':
      // snapshot.ref.set('open');
      notifyBiteIsClosed(orderId);
      break;
  }
}
