const {
  generateUploadParams,
} = require('./index.js');


describe('uploadImage', () => {
  describe('generateUploadParams', () => {
    // todo: if event is `{}` promise goes unresolved
    // todo: JSON stringify responses
    // todo: 'crop' twice in GM_KEYS

    test('should generate correct upload parameters', (done) => {
      const expected = {
        Bucket: process.env.S3_BUCKET,
        Key: `${process.env.NODE_ENV}/test.jpg`,
        ContentType: 'image/jpeg',
        ACL: 'public-read'
      };
      const actual = generateUploadParams('image/jpeg', '.jpg', 'test');
      expect(actual).toEqual(expected);
      done();
    });
  });
});
