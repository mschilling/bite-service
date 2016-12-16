var firebase = require('firebase').initializeApp({
    serviceAccount: "./.config/service-account.json",
    databaseURL: "https://bite-4ce99.firebaseio.com"
});

var ref = firebase.database().ref();
var subscribeRef = ref.child('subscribe_queue');
var unSubscribeRef = ref.child('subscribe_queue');
var userToken = undefined; // <client_fcntoken>

if(process.argv.length>=3) {
    userToken = process.argv[2];
}

if(!userToken) {
  console.log('Please provide fcn user token');
  process.exit();
  return;
}

function subscribe(token, user = 'hZapjOOmEdZM7IF203pMcB9XIHC2', topic = null, subscribe = false) {
  return subscribeRef.push({ topic: topic, token: token, user: user, subscribe: subscribe})
}

// Initial subscribe from app is without any topic; special case.
// setTimeout(()=> subscribe(userToken, undefined, null, true), 0);

setTimeout(()=> subscribe(userToken, undefined, 'notify_bite_open', true), 0);
setTimeout(()=> subscribe(userToken, undefined, 'notify_bite_closing', true), 0);
setTimeout(()=> subscribe(userToken, undefined, 'notify_bite_closed', true), 0);

// setTimeout(()=> subscribe(userToken, undefined, null, false), 15000)
// setTimeout(()=> subscribe(userToken, undefined, 'notify_bite_open', false), 15000)
setTimeout(()=> subscribe(userToken, undefined, 'notify_bite_closing', false), 20000)
setTimeout(()=> subscribe(userToken, undefined, 'notify_bite_closed', false), 20000)
