var firebase = require('firebase').initializeApp({
  serviceAccount: ".config/service-account.json",
  databaseURL: "https://bite-4ce99.firebaseio.com"
});

var storeId; //= '-KZ6y98jLOluD46CpXQn';

var ref = firebase.database().ref();

var store = { name: 'Primataria Gramsbergen', location: `Gramsbergen` }

var categories = [];
categories.push({ emoji: "🍔", name: "Patat", type: "3"});
categories.push({ emoji: "🍺", name: "Drinken", type: "8"});
categories.push({ emoji: "🍉", name: "Snack", type: "9"});

let storeRef;
if(storeId) {
  storeRef = ref.child(`stores/${storeId}`);
} else {
  storeRef = ref.child('stores').push();
}

// 1. Create new store
storeRef.set(store).then(() => {
  var categoriesRef = storeRef.child('category');
  // 2. (Delete and) create categories
  return categoriesRef.remove().then( () => {
    categories.forEach( c => {
      categoriesRef.push(c);
    })
  })
});

