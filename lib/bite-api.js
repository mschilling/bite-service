'use strict';

require('dotenv').config({silent: true});
const config = require('../config');
const firebase = require('firebase');
const fh = require('./firebase-helper');

firebase.initializeApp({
  serviceAccount: config.firebase.serviceAccount,
  databaseURL: config.firebase.databaseURL
});

const ref = firebase.database().ref();

function getFirebaseRef() {
  return ref;
}

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

function setUserSubscriptions(userId, obj) {
  const updateRef = ref.child('user_subscriptions').child(`/${userId}`);
  return updateRef.set(obj);
}

function setUserSubscription(userId, updates) {
  const updateRef = ref.child('user_subscriptions').child(`/${userId}`);
  return updateRef.update(updates);
}

function removeSubscriptionFromQueue(key) {
  return ref.child(`subscribe_queue/${key}`).remove();
}

function archiveOrder(biteId) {
  if (!biteId) return;

  console.log('archive order ' + biteId);

  // Move Bite to closed node
  const oldRef = ref.child('orders').child(biteId);
  const newRef = ref.child('closed_order').push();
  fh.moveFbRecord(oldRef, newRef);

  // Move Bite orders to closed node
  const oldUserOrdersRef = ref.child('user_order').child(biteId);
  const newUserOrdersRef = ref.child('closed_user_order').push();
  fh.moveFbRecord(oldUserOrdersRef, newUserOrdersRef);
};

module.exports = {
  // methods
  getFirebaseRef: getFirebaseRef,

  getRestaurant: getRestaurant,
  getUser: getUser,

  setUserSubscription: setUserSubscription,
  setUserSubscriptions: setUserSubscriptions,
  removeSubscriptionFromQueue: removeSubscriptionFromQueue,

  archiveOrder: archiveOrder,
};
