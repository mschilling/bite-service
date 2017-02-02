'use strict';

require('dotenv').config({silent: true});
const config = require('../config');
const moment = require('moment');
const api = require('../lib/bite-api');

const ref = api.getFirebaseRef();
const baseRef = ref.child('_seed');

getStoreData(3, 'Kebab', 'Gramsbergen')
  .then((store) => {
    const targetRef = baseRef.child(`restaurants/${store.id}`);

    const categories = [];
    switch (store.id) {
      case 1:
        categories.push({emoji: '🍔', name: 'Patat', type: '3'});
        categories.push({emoji: '🍺', name: 'Drinken', type: '8'});
        categories.push({emoji: '🍉', name: 'Snack', type: '9'});
       break;
      case 2:
        categories.push({emoji: '🍔', name: 'Patat', type: '3'});
        categories.push({emoji: '🍺', name: 'Drinken', type: '8'});
        categories.push({emoji: '🍉', name: 'Snack', type: '9'});
        break;
      case 3:
        categories.push({emoji: '🍔', name: 'Patat', type: '3'});
        categories.push({emoji: '🍺', name: 'Drinken', type: '8'});
        categories.push({emoji: '🍉', name: 'Snack', type: '9'});
        break;
    }
    store.categories = categories;
    targetRef.set(store);
  });

function getStoreProducts(storeName) {
  return ref.child('_michael/bite_seed').orderByChild('Store').equalTo(storeName).once('value')
    .then((snapshot) => {
      const products = [];
      snapshot.forEach((itemSnapshot) => {
        products.push(itemSnapshot.val());
      });
      return products;
    });
}

function getStoreData(id, name, location) {
  const store = {
    id: id,
    name: name,
    location: location
  };

  return getStoreProducts(store.name)
    .then((products) => {

      store.products = products.map(p => {
        return {
          name: p.Product,
          price: p.Price,
          isSauce: (p.IsSauze === 1 ? true : false)
        };
      })
        .sort((a, b) => {
          return a.name > b.name ? 1 : -1;
        });
      ;


      // console.log(products);
      return store;
    });
}

