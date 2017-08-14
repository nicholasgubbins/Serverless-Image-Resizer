const gm = require('gm').subClass({ imageMagick: true });
const Promise = require('bluebird');
const AWS = require('aws-sdk');

const s3 = new AWS.S3();
const S3Stream = require('s3-upload-stream')(s3);

const DEFAULT_TIME_OUT = 15000;

function gmCreator(asset, bucket, resizeOptions) { // function to create a GM process
  return new Promise((resolve, reject) => {
    try {
      const func = gm(s3.getObject({ Bucket: bucket, Key: asset }).createReadStream());
      func.options({ timeout: resizeOptions.timeout || DEFAULT_TIME_OUT });
      if (resizeOptions.quality) func.quality(resizeOptions.quality);
      if (resizeOptions.resize && resizeOptions.crop) {
        func.resize(resizeOptions.resize.width, resizeOptions.resize.height, '^');
      } else if (resizeOptions.resize) {
        func.resize(resizeOptions.resize.width, resizeOptions.resize.height);
      }
      if (resizeOptions.filter) func.filter(resizeOptions.filter);
      if (resizeOptions.strip) func.strip();
      if (resizeOptions.gravity) func.gravity(resizeOptions.gravity);
      if (resizeOptions.crop) func.crop(resizeOptions.crop.width, resizeOptions.crop.height, 0, 0);
      if (resizeOptions.max) func.resize(resizeOptions.max);
      if (resizeOptions.compress) func.compress(resizeOptions.compress);
      if (resizeOptions.blur) { func.blur(resizeOptions.blur[0], resizeOptions.blur[1]); }
      return resolve(func);
    } catch (err) {
      return reject({ statusCode: 500, body: `{"message":"${err.message}"}` });
    }
  });
}

function uploadToS3(destination, bucket, mimeType, storageClass, gmArg) {
  return new Promise((resolve, reject) => {
    try {
      const targetStream = S3Stream.upload({
        Bucket: bucket,
        Key: destination,
        ContentType: mimeType,
        StorageClass: storageClass,
      });
      const fileType = mimeType.substring(mimeType.indexOf('/') + 1);
      gmArg.stream(fileType, (err, stdout, stderr) => {
        if (err) {
          return reject({ statusCode: 500, body: `{"message":"${err.message}"}` });
        }

        stdout.on('error', err2 => reject({ statusCode: 500, body: `{"message":"${err2.message}"}` }));
        stderr.on('data', data => reject({ statusCode: 500, body: `{"message":"${data}"}` }));
        stdout.pipe(targetStream)
          .on('uploaded', () => resolve())
          .on('error', err3 => reject({ statusCode: 500, body: `{"message":"${err3.message}"}` }));
        return '';
      });
    } catch (err) {
      return reject({ statusCode: 500, body: `{"message":"${err.message}"}` });
    }
    return '';
  });
}


const EVENT_PARAMS = {
  asset: { type: 'string', required: true },
  destination: { type: 'string', required: true },
  bucket: { type: 'string', required: true },
  resize_options: { type: 'object', required: true },
  mime_type: { type: 'string', required: true },
  storage_class: { type: 'string', default: 'STANDARD' },
};
const GM_KEYS = ['timeout',
  'quality',
  'resize',
  'crop',
  'resize',
  'filter',
  'strip',
  'gravity',
  'crop',
  'max',
  'compress',
  'blur'];

function formatEvent(event = {}) {
  return new Promise((resolve, reject) => {
    const job = {};
    Object.keys(EVENT_PARAMS).forEach((k) => {
      if (!event[k] && EVENT_PARAMS[k].required) return reject({ statusCode: 400, body: `{"message": "${k} required"}` });
      else if (typeof event[k] !== EVENT_PARAMS[k].type) { // eslint-disable-line
        return reject({ statusCode: 400, body: `{"message": "${k} should be of type ${EVENT_PARAMS[k].type}"}` });
      }
      job[k] = event[k] || EVENT_PARAMS.default;
      return '';
    });
    Object.keys(job.resize_options).forEach((k) => {
      if (GM_KEYS.indexOf(k) === -1) { delete job.resize_options[k]; }
    });
    return resolve(job);
  });
}

module.exports.handler = (event, context) => formatEvent(event)
  .then(job => gmCreator(job.asset, job.bucket, job.resize_options)
    .then(gmArg => uploadToS3(job.destination, job.bucket, job.mime_type, job.storage_class, gmArg))
    .then(() => context.succeed({ success: true })))
  .catch((e) => {
    context.fail(JSON.stringify(e));
  });

module.exports.formatEvent = formatEvent;
