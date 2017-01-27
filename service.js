'use strict';

require('dotenv').config({ silent: true });
const config = require('./config');
const moment = require('moment');
const api = require('./lib/bite-api');
const fcm = require('./lib/fcm-helper');

const ref = api.getFirebaseRef();
fcm.setAuthorization(config.fcm.authKey);
// fcm.setDebugToken(config.fcm.debugToken);

ref.child('orders').on('child_added', (snapshot) => {
  console.log(`Order ${snapshot.key} added`);
  verifyOrderConsistency(snapshot)
    .then((snapshot) => {
      snapshot.ref.child('status').on('value', onOrderStatusChanged);
      snapshot.ref.child('action').on('value', onOrderActionChanged);
    });
});

ref.child('subscribe_queue').on('child_added', onSubscribe);

// On Every Order Removed
ref.child('orders').on('child_removed', cleanupOrderData);

function onOrderStatusChanged(snapshot) {
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

function onOrderActionChanged(snapshot) {
  const orderId = snapshot.ref.parent.key;
  switch (snapshot.val()) {
    case 'archive':
      snapshot.ref.remove()
        .then(() => api.archiveOrder(orderId));
      break;
    case 'close':
      snapshot.ref.remove()
        .then(() => snapshot.ref.parent.child('status').set('closed'));
      break;
  }
}

function notifyBiteIsOpen(orderId) {
  getOrderDetails(orderId)
    .then((data) => {
      fcm.sendPush({
        collapse_key: orderId,
        to: '/topics/notify_bite_open',
        data: {
          type: 0,
          message: `${data.user.name} heeft een nieuwe Bite geopend bij ${data.store.name}!`,
          title: `${data.store.name} is open ${data.store.emojis}`,
          bite: orderId,
          image_url: data.user.photo_url
        }
      });
    });
}

function notifyBiteIsClosed(orderId) {
  getOrderDetails(orderId)
    .then((data) => {
      fcm.sendPush({
        collapse_key: orderId,
        to: '/topics/notify_bite_closed',
        data: {
          type: 0,
          title: `${data.store.name} is gesloten`,
          message: `${data.user.name}'s Bite ${data.store.name} is nu gesloten 😢`,
          bite: orderId,
          image_url: data.user.photo_url
        }
      });
    });
}

function getOrderDetails(orderId) {
  const orderDetails = {};

  return ref.child('orders/' + orderId).once('value').then((snapshot) => {
    const order = snapshot.val();
    const resolveRestaurant = api.getRestaurant(order.store)
      .then((result) => {
        orderDetails.store = result;
        const items = (result.category || []);
        orderDetails.store.emojis = Object.keys(items).map(key => items[key].emoji).join('');
      });

    const resolveUser = api.getUser(order.opened_by)
      .then((result) => {
        orderDetails.user = result;
        orderDetails.user.name = result.display_name || result.name;
      });

    return Promise.all([resolveRestaurant, resolveUser]).then(() => orderDetails);
  });
}

function onSubscribe(snapshot) {
  let {user, token, topic, subscribe = false} = snapshot.val();
  const value = (subscribe === true ? true : null);
  const updates = {};

  if (topic) {
    updates[topic] = value;

    if (subscribe) {
      fcm.subscribeTopic(token, topic);
    } else {
      fcm.unSubscribeTopic(token, topic);
    }
  } else {
    ref.child('user_subscriptions/' + user + '/').once('value').then(function (snapshot) {
      let subscriptions = snapshot.val();
      if (!subscriptions) {
        subscriptions = {
          notify_bite_open: true,
          notify_bite_closing: true,
          notify_bite_closed: true,
          notify_system: true
        };
        api.setUserSubscriptions(user, subscriptions);
      }

      Object.keys(subscriptions).forEach((t) => {
        // updates[`user_subscriptions/${user}`] = {[t]: value};
        updates[t] = value;

        if (subscribe) {
          fcm.subscribeTopic(token, t);
        } else {
          fcm.unSubscribeTopic(token, t);
        }
      });
    });
  }

  // api.setUserSubscription(user, updates);

  // Cleanup form queue
  setTimeout(() => api.removeSubscriptionFromQueue(snapshot.key), 1000);
};

function verifyOrderConsistency(snapshot) {
  // let { user, token, topic, subscribe = false } = snapshot.val();
  const order = snapshot.val();
  const now = moment.now();
  let objectChanged = false;

  // order.min_before_closing = order.min_before_closing || defaultOpenTimeInMinutes;

  // let openTime = moment(order.open_time);
  // let closingTime = moment(openTime).add(defaultOpenTimeInMinutes, 'minutes');

  // let duration = moment.duration(order.min_before_closing, 'minutes');
  // console.log(duration.humanize());

  if (!order.open_time) {
    order.open_time = now.valueOf();
    objectChanged = true;
  }

  if (!order.status) {
    order.status = 'new';
    objectChanged = true;
  }

  if (!order.close_time && order.duration) {
    const closingTime = moment(order.open_time).add(order.duration, 'minutes');
    order.close_time = closingTime.valueOf();
    objectChanged = true;
  }

  if (objectChanged) {
    return snapshot.ref.set(order).then(() => snapshot);
  }

  return Promise.resolve(snapshot);
}

function cleanupOrderData(snapshot) {
  const userOrderRef = ref.child('user_order').child(snapshot.key);
  const userOrderLockedRef = ref.child('user_order_locked').child(snapshot.key);

  if (snapshot.val().status !== 'closed') {
    // remove user orders + locked references
    userOrderRef.remove();
    userOrderLockedRef.remove();
  }
}

function archiveOrders() {
  console.log(moment().format(), 'Archiving orders');
  ref.child('orders').once('value').then((snapshot) => {
    snapshot.forEach(function (orderSnapshot) {
      let order = orderSnapshot.val();
      if (order.status === 'closed') {
        api.archiveOrder(orderSnapshot.key);
      }
    });
  });
}

function startArchiver() {
  console.log('Archiver started');
  let timer = setTimeout(onArchiverTimer, getNextTimerValue());

  function onArchiverTimer() {
    archiveOrders();

    // Reschedule
    timer = setTimeout(onArchiverTimer, getNextTimerValue());
  }

  function getNextTimerValue() {
    const every5minutes = (moment().add(5, 'minutes'));
    const hourly = moment().add(1, 'hour').startOf('hour');
    const midnight = (moment().endOf('day'));
    return every5minutes.diff(moment(), 'milliseconds');
    // return 5000;
  }
}

startArchiver();


