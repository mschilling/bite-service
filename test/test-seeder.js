'use strict';

require('dotenv').config({ silent: true });
const config = require('../config');
const moment = require('moment');
const api = require('../lib/bite-api');

const ref = api.getFirebaseRef();
const baseRef = ref.child('_seed');

seedRestaurantData(3)
  .then(() => console.log('Done!'));


function seedRestaurantData(restaurantId) {
  console.log('Seed restaurant data');
  const sourceRef = ref.child(`_seed/restaurants/${restaurantId}`);

  return sourceRef.once('value')
    .then((snapshot) => {
      return createStore(snapshot.val());
    });
}


function createStore(obj) {
  if (!obj.id) return Promise.reject('id is null');

  const store = {
    id: obj.id,
    name: obj.name,
    location: obj.location
  };

  const storeCategories = obj.categories;
  const storeProducts = obj.products;

  const storeRef = ref.child(`stores/${store.id}`);

  // 1. Create new store
  return storeRef.set(store)
    .then(() => {
      const categoriesRef = storeRef.child('category');
      // 2. (Delete and) create categories
      return categoriesRef.remove().then(() => {
        storeCategories.forEach(c => {
          categoriesRef.push(c);
        });
      })
      .then(() => {
        if(!store.id) return Promise.reject('Store ID is null');
        const productsRef = ref.child(`products/${store.id}/products`);
        // console.log(storeProducts, productsRef.ref);
        return storeProducts.forEach(p=> {
          productsRef.push(p);
        });
      });
    });

  ;
}
