var fbAuthKey = require('./../.config/config.json').fbAuthKey;
var fcm = require('../lib/fcm-helper');
fcm.setAuthorization(fbAuthKey);

var firebase = require('firebase').initializeApp({
  serviceAccount: './.config/service-account.json',
  databaseURL: 'https://bite-4ce99.firebaseio.com'
});


var pl = {
  to: "fXhOvktGn10:APA91bGIIpPRIBLr8qVopQLPoeSWtFngKTCtv3mMo1eJjdN0qKs1T5BVB09xvpH2MmczBBOTEYkgDaa5dCan2yEnhbibA5kIh1o-Ssjd5o0GvDD7MijHtTpD56Zx0URwViW4RrQRWcG7",
  data: {
    type: 0,
    message: "Hier het bericht 2",
    title: "Titel van push",
    bite: "bite key",
    image_url: 'https://static.thuisbezorgd.nl/images/restaurants/nl/NP07RON/logo_small.png' //
  }
}

fcm.sendPush(pl);
