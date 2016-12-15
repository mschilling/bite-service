var PushService = require('./../push-service');

var fbAuthKey = require('./../.config/config.json').fbAuthKey;

var firebase = require('firebase').initializeApp({
    serviceAccount: "./.config/service-account.json",
    databaseURL: "https://bite-4ce99.firebaseio.com"
});



 var pl = {
        to: "<push_key>",
        data: {
            type: 0,
            message: "Hier het bericht 2",
            title: "Titel van push",
            bite: "bite key",
            image_url: 'https://static.thuisbezorgd.nl/images/restaurants/nl/NP07RON/logo_small.png' //
        }
    }

PushService.sendPush(pl);
