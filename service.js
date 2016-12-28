const moment = require('moment');
const api = require('./lib/bite-api');

const fbAuthKey = require('./.config/config.json').fbAuthKey;
const fcm = require('./lib/fcm-helper');
fcm.setAuthorization(fbAuthKey);

// var Service = require('./lib/subscription-service');
// var service = new Service(firebase);
// service.start();

api.onBiteOpened((snapshot) => notifyBiteIsOpen(snapshot));
api.onBiteClosed((snapshot) => api.archiveBite(snapshot.key));
api.onBiteRemoved((snapshot) => notifyBiteIsClosed(snapshot));

function notifyBiteIsOpen(snapshot) {
  getOrderDetails(snapshot.val())
    .then((data) => {
      fcm.sendPush({
        to: '/topics/notify_bite_open',
        data: {
          type: 0,
          message: `${data.user.name} heeft een nieuwe Bite geopend bij ${data.store.name}!`,
          title: `${data.store.name} is open ${data.store.emojis}`,
          bite: snapshot.key,
          image_url: data.user.photo_url
        }
      });
    });
}

function notifyBiteIsClosed(snapshot) {
  getOrderDetails(snapshot.val())
    .then((data) => {
      fcm.sendPush({
        to: '/topics/notify_bite_closed',
        data: {
          type: 0,
          title: `${data.store.name} is gesloten`,
          message: `${data.user.name}'s Bite ${data.store.name} is helaas verwijderd 😢`,
          bite: snapshot.key,
          image_url: data.user.photo_url
        }
      });
    });
}

function getOrderDetails(order) {
  const orderDetails = {};

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
}
