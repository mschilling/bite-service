const firebase = require('firebase').initializeApp({
  serviceAccount: './.config/service-account.json',
  databaseURL: 'https://bite-4ce99.firebaseio.com'
});
const fh = require('./firebase-helper');
const ref = firebase.database().ref();

function getRestaurant(id) {
  return ref.child('stores').child(id).once('value').then(function(snapshot) {
    return snapshot.val();
  });
}

function getUser(id) {
  return ref.child('users').child(id).once('value').then(function(snapshot) {
    return snapshot.val();
  });
}

function openBite() { };

function reopenBite() { };

function archiveBite(biteId) {
  if (!biteId) return;

  // Move Bite to closed node
  const oldRef = ref.child('orders/' + biteId);
  const newRef = ref.child('closed_order').push();
  fh.moveFbRecord(oldRef, newRef);

  // Move Bite orders to closed node
  const oldUserOrdersRef = ref.child('user_order/' + biteId);
  const newUserOrdersRef = ref.child('closed_user_orders').push();
  fh.moveFbRecord(oldUserOrdersRef, newUserOrdersRef);
};

function removeBite() { };

function onBiteClosed(callback) {
  ref.child('orders').on('child_added', (snapshotOrder) => {
    ref.child(`orders/${snapshotOrder.key}/closed`).on('value', (snapshot) => {
      if (snapshot.val() === true) {
        console.log('onBiteClosed', snapshot.key);
        if (callback) callback(snapshotOrder);
      }
    });
  });
}

function onBiteOpened(callback) {
  ref.child('orders').on('child_added', (snapshot) => {
    console.log('onBiteOpened', snapshot.key);
    callback(snapshot);
  });
}

function onBiteRemoved(callback) {
  ref.child('orders').on('child_removed', (snapshot) => {
    console.log('onBiteRemoved', snapshot.key);
    callback(snapshot);
  });
}


module.exports = {
  // methods

  getRestaurant: getRestaurant,
  getUser: getUser,

  archiveBite: archiveBite,

  // events
  onBiteOpened: onBiteOpened,
  onBiteClosed: onBiteClosed,
  onBiteRemoved: onBiteRemoved
};
