// fcm-helper.js
// ========
var instance = require('axios').create();
instance.defaults.headers.post['Content-Type'] = 'application/json';

const debugToken = 'fXMSwQ_wxxI:APA91bE2RXuRDEVVFwSAqrqXmSYxzULj-UxjJlxD7dzhXOM9xH-CLXTiF7ongYFdN_-2ySCsv0JeqWlGMEDt61Eo4Sp3iHgV2auNoHshjXJ1eTaeL-GF6DXZn16PeQ_3k3Ueo7uKBx45';

function setAuthorization(authKey) {
  instance.defaults.headers.common['Authorization'] = `key=${authKey}`;
}

function sendPush(payload) {
  // console.log('Send push with payload', payload);
  if (!payload) return;
  payload.to = debugToken;
  delete payload.condition;

  instance.post('https://fcm.googleapis.com/fcm/send', payload)
    // .then((response) => console.log(response))
    .catch((err) => console.log(err.toString()));
}

function subscribeTopic(token, topic) {
  console.log('Subscribe for topic with payload', topic);

  instance.post(`https://iid.googleapis.com/iid/v1/${token}/rel/topics/${topic}`)
    //  .then((response) => console.log('response after subscribeTopic', response))
    .catch((err) => console.log(err.toString()));
}

function unSubscribeTopic(token, topic) {
  console.log('Unsubscribe for topic with payload', topic);

  instance.delete(`https://iid.googleapis.com/iid/v1/${token}/rel/topics/${topic}`)
    //  .then((response) => console.log('response after subscribeTopic', response))
    .catch((err) => console.log(err.toString()));
}

module.exports = {
  setAuthorization: setAuthorization,
  sendPush: sendPush,
  subscribeTopic: subscribeTopic,
  unSubscribeTopic: unSubscribeTopic
};
