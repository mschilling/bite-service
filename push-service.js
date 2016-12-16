var axios = require('axios');
var serverKey = require('./.config/config.json').fbAuthKey;

var instance = axios.create();
instance.defaults.headers.common['Authorization'] = `key=${serverKey}`;
instance.defaults.headers.post['Content-Type'] = 'application/json';

//push-service.js
var PushService = function () {};

PushService.prototype.hello = function() {
    return "World";
}

PushService.prototype.sendPush = function(payload) {
  // console.log('Send push with payload', payload);

  instance.post('https://fcm.googleapis.com/fcm/send', payload)
      //  .then((response) => console.log(response))
      .catch((err) => console.log(err.toString()))
}

PushService.prototype.subscribeTopic = function(token, topic) {
    console.log('Subscribe for topic with payload', topic);

    instance.post(`https://iid.googleapis.com/iid/v1/${token}/rel/topics/${topic}`)
        //  .then((response) => console.log('response after subscribeTopic', response))
        .catch((err) => console.log(err.toString()))
}

PushService.prototype.unSubscribeTopic = function(token, topic) {
    console.log('Unsubscribe for topic with payload', topic);

    instance.delete(`https://iid.googleapis.com/iid/v1/${token}/rel/topics/${topic}`)
        //  .then((response) => console.log('response after subscribeTopic', response))
        .catch((err) => console.log(err.toString()))
}

module.exports = new PushService();
