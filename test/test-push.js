var PushService = require('./../push-service');

var fbAuthKey = require('./../.config/config.json').fbAuthKey;

var firebase = require('firebase').initializeApp({
    serviceAccount: "./.config/service-account.json",
    databaseURL: "https://bite-4ce99.firebaseio.com"
});



 var pl = {
        to: "fKxWyn0o4nY:APA91bEvlfda3qkP593bjrNMnlsPuHkAYo8Z-9PuqHyvFN3aPiUsEhPfH8nwYhtFo7qQ8qUiqLWqzit-4nUIl6AluYFSu9l3GucXWYR1pyK94TrcJmrQQo9NRmWilnaQp3XH8fvZJ3Fe",
        data: {
            type: 0,
            message: "Hier het bericht 2",
            title: "Titel van push",
            bite: "bite key",
            image_url: 'https://static.thuisbezorgd.nl/images/restaurants/nl/NP07RON/logo_small.png' //
        }
    }

PushService.sendPush(pl);
