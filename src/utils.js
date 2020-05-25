const util = require('util');

exports.getAtRandomIndex = function getAtRandomIndex(arr = []) {
  return arr[Math.floor(Math.random() * (arr.length))];
};

exports.parseBool = function parseBool(str) {
  const hasValidType = ['string', 'number'].includes(typeof str);

  if (!hasValidType) {
    return false;
  }

  const truthyValues = [
    '1',
    'true',
  ];

  return truthyValues.includes(str.toString().toLowerCase());
};

exports.setTimeoutPromise = util.promisify(setTimeout);
