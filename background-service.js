const moment = require('moment');
const api = require('./lib/bite-api');

// const defaultOpenTimeInMinutes = 30;
// let openTime = moment(1483013639874);
// let closingTime = moment(openTime).add(defaultOpenTimeInMinutes, 'minutes');
// console.log(openTime.valueOf(), closingTime.format());

const ref = api.getFirebaseRef();

// On Every Order Added
ref.child('orders').on('child_added', verifyOrderConsistency);

// On Every Order Removed
ref.child('orders').on('child_removed', cleanupOrderData);

function verifyOrderConsistency(snapshot) {
  // let { user, token, topic, subscribe = false } = snapshot.val();
  const order = snapshot.val();
  const now = moment.now();
  let objectChanged = false;

  // order.min_before_closing = order.min_before_closing || defaultOpenTimeInMinutes;

  // let openTime = moment(order.open_time);
  // let closingTime = moment(openTime).add(defaultOpenTimeInMinutes, 'minutes');

  // let duration = moment.duration(order.min_before_closing, 'minutes');
  // console.log(duration.humanize());

  if (!order.open_time) {
    order.open_time = now.valueOf();
    objectChanged = true;
  }

  if (!order.status) {
    order.status = 'new';
    objectChanged = true;
  }

  if (objectChanged) {
    snapshot.ref.set(order);
  }
}

function cleanupOrderData(snapshot) {
  const userOrderRef = ref.child('user_order').child(snapshot.key);
  const userOrderLockedRef = ref.child('user_order_locked').child(snapshot.key);

  if (snapshot.val().status !== 'closed') {
    // remove user orders + locked references
    userOrderRef.remove();
    userOrderLockedRef.remove();
  }
}

function archiveOrders() {
  console.log(moment().format(), 'Archiving orders');
  ref.child('orders').once('value').then((snapshot) => {
    snapshot.forEach(function (orderSnapshot) {
      let order = orderSnapshot.val();
      if (order.status === 'closed') {
        api.archiveOrder(orderSnapshot.key);
      }
    });
  });
}

function startArchiver() {
  let timer = setTimeout(onArchiverTimer, getNextTimerValue());

  function onArchiverTimer() {
    archiveOrders();

    // Reschedule
    timer = setTimeout(onArchiverTimer, getNextTimerValue());
  }

  function getNextTimerValue() {
    let every5minutes = (moment().add(5, 'minutes'));
    let hourly = moment().add(1, 'hour').startOf('hour');
    let midnight = (moment().endOf('day'));
    return hourly.diff(moment(), 'milliseconds');
    // return 5000;
  }
}

startArchiver();


