// const moment = require('moment');
const api = require('./lib/bite-api');
const ref = api.getFirebaseRef();

const fbConfig = require('./.config/config.json');
const fcm = require('./lib/fcm-helper');
fcm.setAuthorization(fbConfig.fbAuthKey);
fcm.setDebugToken(fbConfig.fcmDebugToken);

api.onSubscribe((snapshot) => onSubscribe(snapshot));

ref.child('orders').on('child_added', (snapshot) => {
  snapshot.ref.child('status').on('value', onOrderStatusChanged);
});

function onOrderStatusChanged(snapshot) {
  const orderId = snapshot.ref.parent.key;
  console.log(`Order status ${orderId} set to ${snapshot.val()}`);
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

function notifyBiteIsOpen(orderId) {
  getOrderDetails(orderId)
    .then((data) => {
      fcm.sendPush({
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
  let value = (subscribe === true ? true : null);
  const updates = {};

  if (topic) {
    updates[topic] = value;

    if (subscribe) {
      fcm.subscribeTopic(token, topic);
    } else {
      fcm.unSubscribeTopic(token, topic);
    }
  } else {
    // Initial setup? Subscribe to notify_system and all
    ['notify_system', 'notify_all'].forEach((t) => {
      // updates[`user_subscriptions/${user}`] = {[t]: value};
      updates[t] = value;

      if (subscribe) {
        fcm.subscribeTopic(token, t);
      } else {
        fcm.unSubscribeTopic(token, t);
      }
    });
  }

  api.setUserSubscription(user, updates);

  // Cleanup form queue
  setTimeout(() => api.removeSubscriptionFromQueue(snapshot.key), 1000);
};
