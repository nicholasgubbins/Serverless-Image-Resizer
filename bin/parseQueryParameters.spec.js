const pqp = require('./parseQueryParameters');

// todo: test bad input to show params are ignored

describe('parseQueryParameters', () => {
  test('should return `{}` for no query params', () => {
    const actual = pqp({}); // todo: support passing in `undefined`?
    const expected = {};
    expect(actual).toEqual(expected);
  });

  // query.w
  //   && h
  //   && f
  test('should parse query.w', () => {
    const actual = pqp({ w: 100 });
    const expected = {
      gravity: 'Center',
      resize: {
        height: null,
        width: 100,
      },
    };
    expect(actual).toEqual(expected);
  });

  // todo: overwritten code? if (query.f) format.filter = 'Point';
  test('should parse query.w & f', () => {
    const actual = pqp({ w: 100, f: 'test' });
    const expected = {
      gravity: 'Center',
      resize: {
        height: null,
        width: 100,
      },
      filter: 'test',
    };
    expect(actual).toEqual(expected);
  });

  // query.h
  //   && w
  //   && f
  test('should parse query.h', () => {
    const actual = pqp({ h: 100 });
    const expected = {
      gravity: 'Center',
      resize: {
        height: 100,
        width: null,
      },
    };
    expect(actual).toEqual(expected);
  });

  // todo: test query.h is array?

  // query.h & query.w
  test('should parse query.h', () => {
    const actual = pqp({ h: 100, w: 200 });
    const expected = {
      gravity: 'Center',
      resize: {
        height: 100,
        width: 200,
      },
      crop: {
        height: 100,
        width: 200,
      },
    };
    expect(actual).toEqual(expected);
  });

  // query.f
  test('should parse query.f', () => {
    const actual = pqp({ f: 'test' });
    const expected = { filter: 'test' };
    expect(actual).toEqual(expected);
  });

  // query.q
  test('should parse query.q', () => {
    const actual = pqp({ q: 3 });
    const expected = { quality: 3 };
    expect(actual).toEqual(expected);
  });

  // query.m
  test('should parse query.m', () => {
    const actual = pqp({ m: 3 });
    const expected = { max: 3 };
    expect(actual).toEqual(expected);
  });

  // query.b
  test('should parse query.b', () => {
    const actual = pqp({ b: '123x456' });
    const expected = { blur: ['123', '456'] };
    expect(actual).toEqual(expected);
  });
});
