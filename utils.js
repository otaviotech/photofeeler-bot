const util = require('util');

module.exports.getAtRandomIndex = function getAtRandomIndex(arr = []) {
  return arr[Math.floor(Math.random() * (arr.length))];
}

module.exports.setTimeoutPromise = util.promisify(setTimeout);
