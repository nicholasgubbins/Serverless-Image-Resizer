

const gm = require('gm').subClass({ imageMagick: true });
const Promise = require('bluebird');
const AWS = require('aws-sdk');

const s3 = new AWS.S3();
const S3Stream = require('s3-upload-stream')(s3);


const DEFAULT_TIME_OUT = 15000;


function gmCreator(asset, bucket, resize_options) { // function to create a GM process
  return new Promise((resolve, reject) => {
    try {
      const func = gm(s3.getObject({ Bucket: bucket, Key: asset }).createReadStream());
      func.options({ timeout: resize_options.timeout || DEFAULT_TIME_OUT });
      if (resize_options.quality) func.quality(resize_options.quality);
      if (resize_options.resize && resize_options.crop) func.resize(resize_options.resize.width, resize_options.resize.height, '^');
      else if (resize_options.resize) func.resize(resize_options.resize.width, resize_options.resize.height);
      if (resize_options.filter) func.filter(resize_options.filter);
      if (resize_options.strip) func.strip();
      if (resize_options.gravity) func.gravity(resize_options.gravity);
      if (resize_options.crop) func.crop(resize_options.crop.width, resize_options.crop.height, 0, 0);
      if (resize_options.max) func.resize(resize_options.max);
      if (resize_options.compress) func.compress(resize_options.compress);
      if (resize_options.blur) { func.blur(resize_options.blur[0], resize_options.blur[1]); }
      return resolve(func);
    } catch (err) {
      return reject({ statusCode: 500, body: `{"message":"${err.message}"}` });
    }
  });
}

function uploadToS3(destination, bucket, mime_type, storage_class, gm) {
  return new Promise((resolve, reject) => {
    try {
      const target_stream = S3Stream.upload({
        Bucket: bucket,
        Key: destination,
        ContentType: mime_type,
        StorageClass: storage_class,
      });
      const file_type = mime_type.substring(mime_type.indexOf('/') + 1);
      gm.stream(file_type, (err, stdout, stderr) => {
        if (err) {
          return reject({ statusCode: 500, body: `{"message":"${err.message}"}` });
        }

        stdout.on('error', err => reject({ statusCode: 500, body: `{"message":"${err.message}"}` }));
        stderr.on('data', data => reject({ statusCode: 500, body: `{"message":"${data}"}` }));
        stdout.pipe(target_stream)
          .on('uploaded', done => resolve())
          .on('error', err => reject({ statusCode: 500, body: `{"message":"${err.message}"}` }));
      });
    } catch (err) {
      return reject({ statusCode: 500, body: `{"message":"${err.message}"}` });
    }
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

function formatEvent(event) {
  return new Promise((resolve, reject) => {
    event = (!event) ? {} : event;
    const job = {};
    Object.keys(EVENT_PARAMS).forEach((k) => {
      if (!event[k] && EVENT_PARAMS[k].required) return reject({ statusCode: 400, body: `{"message": "${k} required"}` });
      else if (typeof event[k] !== EVENT_PARAMS[k].type) return reject({ statusCode: 400, body: `{"message": "${k} should be of type ${EVENT_PARAMS[k].type}"}` });
      job[k] = event[k] || EVENT_PARAMS.default;
    });
    Object.keys(job.resize_options).forEach((k) => { if (GM_KEYS.indexOf(k) == -1) { delete job.resize_options[k]; } });
    return resolve(job);
  });
}


module.exports.handler = (event, context, callback) => formatEvent(event)
  .then(job => gmCreator(job.asset, job.bucket, job.resize_options)
    .then(gm => uploadToS3(job.destination, job.bucket, job.mime_type, job.storage_class, gm))
    .then(() => context.succeed({ success: true })))
  .catch((e) => {
    context.fail(JSON.stringify(e));
  });

module.exports.formatEvent = formatEvent;

