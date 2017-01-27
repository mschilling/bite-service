'use strict';

require('dotenv').config({ silent: true });
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

function getOrder(orderKey) {
  return ref.child('orders').child(orderKey).once('value').then(p => p.val());
}

function getProduct(storeKey, productKey) {
  // console.log(`products/${storeKey}/products/${productKey}`);
  const productRef = ref.child(`products/${storeKey}/products/${productKey}`);
  return productRef.once('value').then(p => p.val());
}

function getRestaurant(id) {
  return ref.child('stores').child(id).once('value').then(p => p.val());
}

function getUser(id) {
  return ref.child('users').child(id).once('value').then(function (snapshot) {
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

function delay(t) {
  return new Promise(function (resolve) {
    setTimeout(resolve, t);
  });
}

// function _removeArchivedOrder(orderKey) {
//   const updates = {};
//   updates[ `archive/orders/${orderKey}`] = null;
//   // updates[ 'widgets/' + widgetId ] = widgetData;
//   return ref.update(updates);
// }

function _archiveOrder(orderKey) {
  const sourceRef = ref.child(`orders/${orderKey}`);
  const targetRef = ref.child(`archive/orders/${orderKey}`);
  return sourceRef.once('value').then((snapshot) => {
    targetRef.set(snapshot.val());
  });
}

function _archiveOrderUserOrderItems(orderKey) {
  const sourceRef = ref.child(`user_order/${orderKey}`);
  return sourceRef.once('value').then((snapshot) => {
    return snapshot.forEach((userOrderSnapshot) => {
      const userKey = userOrderSnapshot.key;
      const refUserOrderLocked = ref.child(`user_order_locked/${orderKey}/${userKey}`);
      const targetRef = ref.child(`archive/order_items_per_order/${orderKey}/${userKey}`);
      refUserOrderLocked.once('value').then((uol) => {
        if (uol.val()) {
          targetRef.set(userOrderSnapshot.val());
        };
      });
    });
  });
}

function _archiveUserOrderItems(orderKey) {
  let order = {};
  let store = {};

  getOrder(orderKey).then(o => {
    order = o;
    getRestaurant(o.store).then(s => {
      store = s;
    });
  })
  .then(() => {
    const sourceRef = ref.child(`user_order/${orderKey}`);
    return sourceRef.once('value').then((snapshot) => {
      return snapshot.forEach((userOrderSnapshot) => {
        const userKey = userOrderSnapshot.key;
        const refUserOrderLocked = ref.child(`user_order_locked/${orderKey}/${userKey}`);
        const targetRef = ref.child(`archive/order_items_per_user/${userKey}/${orderKey}`);
        refUserOrderLocked.once('value').then((uol) => {
          if (uol.val()) {
            const newOrder = {};
            newOrder.store = store.name;
            newOrder.location = store.location;
            newOrder.open_time = order.open_time;
            newOrder.close_time = order.close_time;

            targetRef.set(newOrder).then(() => {
              userOrderSnapshot.forEach(orderItemSnapshot => {

                getProduct(order.store, orderItemSnapshot.key)
                  .then(product => {
                    const orderItem = orderItemSnapshot.val();
                    orderItem.name = product.name;
                    orderItem.price = product.price;

                    // Add product with detail information to product
                    targetRef.child(`products/${orderItemSnapshot.key}`).set(orderItem);
                  });
              });
            });
          }
        });
      });
    });
  });
}

function archiveOrder(orderKey) {
  const actions = [];

  actions.push(delay(100).then(() => _archiveUserOrderItems(orderKey)));
  actions.push(delay(100).then(() => _archiveOrder(orderKey)));
  actions.push(delay(100).then(() => _archiveOrderUserOrderItems(orderKey)));
  return Promise.all(actions)
    // .then(() => delay(5000))
    // .then(() => console.log('5 seconds after achived'))
    // .then(() => ref.child(`orders/${orderKey}`).remove())
    ;
}

// function archiveOrderOld(biteId) {
//   if (!biteId) return;

//   console.log('archive order ' + biteId);

//   // Move Bite to closed node
//   const oldRef = ref.child('orders').child(biteId);
//   const newRef = ref.child('closed_order').push();
//   fh.moveFbRecord(oldRef, newRef);

//   // Move Bite orders to closed node
//   const oldUserOrdersRef = ref.child('user_order').child(biteId);
//   const newUserOrdersRef = ref.child('closed_user_order').push();
//   fh.moveFbRecord(oldUserOrdersRef, newUserOrdersRef);
// };

function removeOrder(orderKey) {
  return ref.child(`orders/${orderKey}`).remove();
}


module.exports = {
  // methods
  getFirebaseRef: getFirebaseRef,

  getRestaurant: getRestaurant,
  getUser: getUser,

  setUserSubscription: setUserSubscription,
  setUserSubscriptions: setUserSubscriptions,
  removeSubscriptionFromQueue: removeSubscriptionFromQueue,

  archiveOrder: archiveOrder,
  removeOrder: removeOrder,
  // archiveOrderOld: archiveOrderOld,
};
