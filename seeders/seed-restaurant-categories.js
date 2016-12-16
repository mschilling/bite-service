var firebase = require('firebase').initializeApp({
  serviceAccount: ".config/service-account.json",
  databaseURL: "https://bite-4ce99.firebaseio.com"
});

var storeId = '-JhLeOlGIEjaIOFHR0xe';
if(process.argv.length>=3) {
  storeId = process.argv[2];
}

var ref = firebase.database().ref();

var categories = [];
categories.push({ emoji: "🍔", name: "Patat", type: "3"});
categories.push({ emoji: "🍺", name: "Drinken", type: "8"});
categories.push({ emoji: "🍉", name: "Snack", type: "9"});

var categoriesRef = ref.child(`stores/${storeId}/category`);
categoriesRef.once('value', (snapshot) => console.log(snapshot.val()));

// categoriesRef.remove().then( () => {
//     categories.forEach( c => {
//         // console.log(c);
//         categoriesRef.push(c);

//     })
// })
