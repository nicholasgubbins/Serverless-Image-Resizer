const {
  formatEvent,
} = require('./index.js');


describe('getImage', () => {
  describe('formatEvent', () => {
    // todo: if event is `{}` promise goes unresolved
    // todo: JSON stringify responses
    // todo: 'crop' twice in GM_KEYS

    test('should reject event without required params', (done) => {
      const expected = {
        statusCode: 400,
        body: '{"message": "asset required"}',
      };
      formatEvent().catch((e) => {
        const { statusCode, body } = expected;
        expect(e.statusCode).toEqual(statusCode);
        expect(e.body).toEqual(body);
        done();
      });
    });

    test('should reject event with incorrect type', (done) => {
      const event = {
        asset: 1234,
      };
      const expected = {
        statusCode: 400,
        body: '{"message": "asset should be of type string"}',
      };
      formatEvent(event).catch((e) => {
        const { statusCode, body } = expected;
        expect(e.statusCode).toEqual(statusCode);
        expect(e.body).toEqual(body);
        done();
      });
    });

    test('should resolve a formatted event', (done) => {
      const event = {
        asset: 'asset',
        destination: 'destination',
        bucket: 'bucket',
        resize_options: {
          crop: 'crop',
          resize: 'resize',
          filter: 'filter',
        },
        mime_type: 'mime_type',
        storage_class: 'storage_class',
      };
      const expected = Object.assign({}, event);
      formatEvent(event).then((actual) => {
        expect(actual).toEqual(expected);
        done();
      });
    });

    test('should delete invalid resize_options', (done) => {
      const event = {
        asset: 'asset',
        destination: 'destination',
        bucket: 'bucket',
        resize_options: {
          removeMe: 'asdf',
          crop: 'crop',
          resize: 'resize',
          removeMeToo: 'xyz',
          filter: 'filter',
        },
        mime_type: 'mime_type',
        storage_class: 'storage_class',
      };

      // todo: Object.assign or spread
      const expected = {
        asset: 'asset',
        destination: 'destination',
        bucket: 'bucket',
        resize_options: {
          removeMe: 'asdf',
          crop: 'crop',
          resize: 'resize',
          removeMeToo: 'xyz',
          filter: 'filter',
        },
        mime_type: 'mime_type',
        storage_class: 'storage_class',
      };
      delete expected.resize_options.removeMe;
      delete expected.resize_options.removeMeToo;

      formatEvent(event).then((actual) => {
        expect(actual).toEqual(expected);
        done();
      });
    });
  });
});
