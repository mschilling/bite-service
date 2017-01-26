// fcm-helper.js
// ========
'use strict';

const moment = require('moment');
var instance = require('axios').create();
instance.defaults.headers.post['Content-Type'] = 'application/json';

let debugToken;

function setAuthorization(authKey) {
  instance.defaults.headers.common['Authorization'] = `key=${authKey}`;
}

function setDebugToken(token) {
  debugToken = token;
}

function sendPush(payload) {
  console.log(new Date().toISOString(), 'Send push notification', payload);
  if (!payload) return;
  if(debugToken) {
    payload.to = debugToken;
    delete payload.condition;
  }
  // Add timesstamp
  if(payload.data.message) {
    let time = moment().format('HH:mm');
    payload.data.message += ` \u00B7 ${time}`;
  }

  instance.post('https://fcm.googleapis.com/fcm/send', payload)
    // .then((response) => console.log(response))
    .catch((err) => console.log(err.toString()));
}

function subscribeTopic(token, topic) {
  // console.log('Subscribe for topic with payload', topic);

  instance.post(`https://iid.googleapis.com/iid/v1/${token}/rel/topics/${topic}`)
    //  .then((response) => console.log('response after subscribeTopic', response))
    .catch((err) => console.log(err.toString()));
}

function unSubscribeTopic(token, topic) {
  // console.log('Unsubscribe for topic with payload', topic);
  instance.delete(`https://iid.googleapis.com/iid/v1/${token}/rel/topics/${topic}`)
    //  .then((response) => console.log('response after subscribeTopic', response))
    .catch((err) => console.log(err.toString()));
}

module.exports = {
  setAuthorization: setAuthorization,
  setDebugToken: setDebugToken,
  sendPush: sendPush,
  subscribeTopic: subscribeTopic,
  unSubscribeTopic: unSubscribeTopic
};
