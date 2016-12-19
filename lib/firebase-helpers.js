// firebase-helpers.js
// ========

function moveFbRecord(oldRef, newRef) {
  oldRef.once('value', function (snap) {
    newRef.set(snap.val(), function (error) {
      if (!error) { oldRef.remove(); }
      else if (typeof (console) !== 'undefined' && console.error) { console.error(error); }
    });
  });
}

function copyFbRecord(oldRef, newRef) {
  oldRef.once('value', function (snap) {
    newRef.set(snap.value(), function (error) {
      if (error && typeof (console) !== 'undefined' && console.error) { console.error(error); }
    });
  });
}

module.exports = {
  copyFbRecord: copyFbRecord,
  moveFbRecord: moveFbRecord
}
