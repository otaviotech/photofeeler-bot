const Utils = require('./utils');

describe('Utils', () => {
  describe('getAtRandomIndex()', () => {
    it('Should return undefined if no array is passed.', () => {
      const result = Utils.getAtRandomIndex();
      expect(result).toBeUndefined();
    });

    it('Should return a random element in the passed array.', () => {
      const arr = [1, 2, 3, 4]
      const result = Utils.getAtRandomIndex(arr);
      const resultIndex = arr.indexOf(result);
      expect(resultIndex).toBeLessThanOrEqual(3);
      expect(resultIndex).toBeGreaterThanOrEqual(0);
    })
  });
});
