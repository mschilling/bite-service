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
    console.log('Send push with payload', payload);

    instance.post('https://fcm.googleapis.com/fcm/send', payload)
                //  .then((response) => console.log(response))
                .catch((err) => console.log(err.toString()))
}

module.exports = new PushService();