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

  describe('parseBool', () => {
    const values = [
      { input: 'True', expectedResult: true },
      { input: 'true', expectedResult: true },
      { input: 'False', expectedResult: false },
      { input: 'false', expectedResult: false },
      { input: {}, expectedResult: false },
      { input: null, expectedResult: false },
      { input: '0', expectedResult: false },
      { input: '1', expectedResult: true },
    ];

    values.forEach(({ input, expectedResult }) => {
      it(`should parse string value ${input} as a boolean ${expectedResult}`, () => {
        const result = Utils.parseBool(input);
        expect(result).toEqual(expectedResult);
      });
    });
  });
});
