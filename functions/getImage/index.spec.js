const {
  generateKey,
  stripQueryParams,
} = require('./index.js');


describe('getImage', () => {
  describe('generateKey', () => {
    test('should strip first slash', () => {
      const actual = generateKey('/path/to/image', {});
      const expected = 'path/to/image';
      expect(actual).toEqual(expected);
    });

    test('should strip first slash', () => {
      const imagePath = 'path/to/image';
      const query = {
        w: 100,
        h: 200,
        f: 'filter',
      };
      const actual = generateKey(imagePath, query);
      const expected = 'path/to/image?f=filter&h=200&w=100';
      expect(actual).toEqual(expected);
    });
  });

  describe('stripQueryParams', () => {
    test('should filter out supported query params', () => {
      const query = {
        a: 'filter this',
        b: 'keep this',
        c: 'filter this',
        f: 'keep this',
        h: 'keep this',
        m: 'keep this',
        q: 'keep this',
        w: 'keep this',
        z: 'filter this',
      };
      const actual = stripQueryParams(query);
      const expected = {
        b: 'keep this',
        f: 'keep this',
        h: 'keep this',
        m: 'keep this',
        q: 'keep this',
        w: 'keep this',
      };
      expect(actual).toEqual(expected);
    });
  });
});
