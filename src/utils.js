const util = require('util');

exports.getAtRandomIndex = function getAtRandomIndex(arr = []) {
  return arr[Math.floor(Math.random() * (arr.length))];
}

exports.setTimeoutPromise = util.promisify(setTimeout);
