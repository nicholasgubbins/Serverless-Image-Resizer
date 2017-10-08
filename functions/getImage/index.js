

const AWS = require('aws-sdk');

const s3 = new AWS.S3();

const parseQueryParameters = require('../../bin/parseQueryParameters');
const Errors = require('../../bin/errors');

function checkS3(key) {
  return new Promise((resolve, reject) => {
    s3.headObject({ Bucket: process.env.BUCKET, Key: key }, (err, metadata) => {
      if (err && ['NotFound', 'Forbidden'].indexOf(err.code) > -1) return resolve();
      else if (err) {
        const e = Object.assign({}, Errors.SOMETHING_WRONG, { err });
        return reject(e);
      }
      return resolve(metadata);
    });
  });
}

function getS3(key) {
  return new Promise((resolve, reject) => {
    s3.getObject({ Bucket: process.env.BUCKET, Key: key }, (err, data) => {
      if (err && err.code == 'NotFound') return reject(Errors.NOT_FOUND);
      else if (err) {
        const e = Object.assign({}, Errors.SOMETHING_WRONG, { err });
        return reject(e);
      }
      const content_type = data.ContentType;
      const image = new Buffer(data.Body).toString('base64');
      return resolve({
        statusCode: 200,
        headers: { 'Content-Type': content_type },
        body: image,
        isBase64Encoded: true,
      });
    });
  });
}


function stripQueryParams(query) {
  query = query || {};
  const return_query = {};
  Object.keys(query).filter(k => ['w', 'h', 'f', 'q', 'm', 'b'].indexOf(k) > -1).sort().forEach(k => return_query[k] = query[k]);
  return return_query;
}

function generateKey(image_path, query) {
  let key = image_path;
  const keys = Object.keys(query);
  if (query && keys.length > 0) {
    key += '?';
    keys.sort().forEach((k, i) => {
      key += `${k}=${query[k]}`;
      if (i !== keys.length - 1) key += '&';
    });
  }
  if (key[0] == '/') key = key.substring(1);
  return key;
}


function resize(data) {
  const lambda = new AWS.Lambda({ region: process.env.region });
  return new Promise((resolve, reject) => lambda.invoke({
    Payload: JSON.stringify(data),
    FunctionName: process.env.RESIZE_LAMBDA,
  }, (err, result) => ((err) ? reject(err) :
    (result.FunctionError) ? reject({ statusCode: 502, body: result.Payload })
      : resolve(result))));
}


function processImage(image_path, query, destination_path) {
  image_path = (image_path[0] == '/') ? image_path.substring(1) : image_path;
  return checkS3(image_path)
    .then((metadata) => {
      if (!metadata) throw Errors.NOT_FOUND;
      console.log('s3 base', image_path, 'exists but we need to process it into', destination_path);
      const lambda_data = {
        mime_type: metadata.ContentType,
        resize_options: parseQueryParameters(query),
        asset: image_path,
        destination: destination_path,
        bucket: process.env.BUCKET,
        storage_class: 'REDUCED_REDUNDANCY',
      };
      console.log(JSON.stringify(lambda_data));

      return resize(lambda_data);
    })
    .then(() => getS3(destination_path));
}

module.exports.handler = (event, context, callback) => {
  const query = stripQueryParams(event.queryStringParameters);
  const key = generateKey(event.path, query);
  console.log(key);
  return checkS3(key)
    .then((metadata) => {
      if (metadata) return getS3(key).then(data => callback(null, data));
      else if (Object.keys(query).length > 0) return processImage(event.path, event.queryStringParameters, key).then(data => callback(null, data));
      return callback(null, Errors.NOT_FOUND);
    })
    .catch((e) => {
      console.log(e);
      console.log(e.stack);
      callback(null, e);
    });
};

module.exports.stripQueryParams = stripQueryParams;
module.exports.generateKey = generateKey;
