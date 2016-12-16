var PushService = require('./push-service');
var _ref;

var SubscriptionService = function (firebaseRef) {
  var fb = firebaseRef;
  _ref = firebaseRef.database().ref()

};

SubscriptionService.prototype.start = function() {
  console.log(`SubscriptionService started at ${new Date().toISOString()}`);

  _ref.child('subscribe_queue').on('child_added', (snapshot => {

    let { user, token, topic, subscribe = false } = snapshot.val();
    let value = ( subscribe === true ? true : null );
    let updateRef = _ref.child('user_subscriptions').child(`/${user}`);
    var updates = {};

    // console.log(snapshot.val(), subscribe);

    if(topic) {
      updates[topic] = value;

      if(subscribe) {
        PushService.subscribeTopic(token, topic);
      } else {
        PushService.unSubscribeTopic(token, topic);
      }

    } else {
      //Initial setup? Subscribe to notify_system and all
      ['notify_system','notify_all'].forEach( (t) => {

        // updates[`user_subscriptions/${user}`] = {[t]: value};
        updates[t] = value;

        if(subscribe) {
          PushService.subscribeTopic(token, t);
        } else {
          PushService.unSubscribeTopic(token, t);
        }

      })

    }

    // Future requirement: check for existence
    // var userRef = _ref.child('users/' + user);

    updateRef.update(updates)

    //Cleanup form queue
    setTimeout( () => _ref.child(`subscribe_queue/` + snapshot.key).remove(), 1000);

  }))

}

module.exports = SubscriptionService;
