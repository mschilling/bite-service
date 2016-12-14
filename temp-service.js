var fbAuthKey = require('./.config/config.json').fbAuthKey;

var firebase = require('firebase').initializeApp({
    serviceAccount: "./.config/service-account.json",
    databaseURL: "https://bite-4ce99.firebaseio.com"    
});

var axios = require('axios');
axios.defaults.headers.common['Authorization'] = `key=${fbAuthKey}`;
axios.defaults.headers.post['Content-Type'] = 'application/json';


var ref = firebase.database().ref();
var now = new Date().getTime();

var users = [];
var stores = [];

function InitializeService() {

    console.log('Initialise service');

    return new Promise(function(resolve,reject){

        ref.child('users').once('value')

        .then((snapshot)=> {
            console.log('Fetching users');
            snapshot.forEach(user => {
                users.push({
                    name: user.val().display_name || user.val().name,
                    photo: user.val().photo_url,
                    key: user.key
                })
            });
            // console.log(users.length);
            return users;
        })

        .then(() => ref.child('stores').once('value'))

        .then((snapshot)=> {
            console.log('Fetching stores');
            snapshot.forEach(store => {
                stores.push({
                    name: store.val().name,
                    location: store.val().location,
                    key: store.key
                })
            });
            // console.log(stores.length);
            return stores;
        }) 

        .then(() => {
            console.log('Initialisation completed');
            resolve(true);
        })

        ;
    })

}

function RunService() {
    return Promise.resolve()
    .then(() => {
        ref.child('orders').on('child_added', (snapshot) => {
            // console.log('Watch orders', snapshot.val(), stores);

            let user = users.find(p=>p.key == snapshot.val().opened_by);
            let store = stores.find(p=>p.key == snapshot.val().store);
            let timestamp = new Date(snapshot.val().open_time || 0).getTime();
            let sendPush = (timestamp > now);

            let title = `${store.name} is open in Bite`;

            let messageTemplates = [
                `${user.name} heeft een nieuwe Bite geopend bij ${store.name}!`
            ]

            let message = messageTemplates;
            console.log(timestamp, `${user.name} heeft een nieuwe Bite geopend bij ${store.name}!`);

            if( !sendPush ) {
                console.log('Don\'t sent push', new Date( timestamp ).toISOString(), new Date(now).toISOString() )
            } else {
                // console.log('Sent push', new Date( timestamp ).toISOString(), new Date(now).toISOString() )

                var payload = {
                    to: "/topics/news",
                    data: {
                        type: 0,
                        message: message,
                        title: title,
                        bite: snapshot.key,
                        image_url: user.photo  //'https://static.thuisbezorgd.nl/images/restaurants/nl/NP07RON/logo_small.png' //                   
                    }
                }

                // disable sending push (for now)
                // axios.post('https://fcm.googleapis.com/fcm/send', payload)
                // // .then((response) => console.log(response))
                // .catch((err) => console.log(err.toString()))

            }


        })

    })

    ;


}

InitializeService()
    .then(() => RunService())
    .then(()=>console.log('Service is running!'));


return;

