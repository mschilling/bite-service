// fcm-helper.js
// ========

var instance = require('axios').create();
instance.defaults.headers.post['Content-Type'] = 'application/json';

function setAuthorization(authKey) {
  instance.defaults.headers.common['Authorization'] = `key=${authKey}`;
}

function sendPush(payload) {
  // console.log('Send push with payload', payload);

  instance.post('https://fcm.googleapis.com/fcm/send', payload)
      //  .then((response) => console.log(response))
      .catch((err) => console.log(err.toString()))
}

function subscribeTopic(token, topic) {
    console.log('Subscribe for topic with payload', topic);

    instance.post(`https://iid.googleapis.com/iid/v1/${token}/rel/topics/${topic}`)
        //  .then((response) => console.log('response after subscribeTopic', response))
        .catch((err) => console.log(err.toString()))
}

function unSubscribeTopic(token, topic) {
    console.log('Unsubscribe for topic with payload', topic);

    instance.delete(`https://iid.googleapis.com/iid/v1/${token}/rel/topics/${topic}`)
        //  .then((response) => console.log('response after subscribeTopic', response))
        .catch((err) => console.log(err.toString()))
}

module.exports = {
  setAuthorization: setAuthorization,
  sendPush: sendPush,
  subscribeTopic: subscribeTopic,
  unSubscribeTopic: unSubscribeTopic
}
