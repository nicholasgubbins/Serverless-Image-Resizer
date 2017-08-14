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
      if (err && err.code === 'NotFound') return reject(Errors.NOT_FOUND);
      else if (err) {
        const e = Object.assign({}, Errors.SOMETHING_WRONG, { err });
        return reject(e);
      }
      const contentType = data.ContentType;
      const image = new Buffer(data.Body).toString('base64');
      return resolve({
        statusCode: 200,
        headers: { 'Content-Type': contentType },
        body: image,
        isBase64Encoded: true,
      });
    });
  });
}

function stripQueryParams(query = {}) {
  const returnQuery = {};
  Object.keys(query)
    .filter(k => ['w', 'h', 'f', 'q', 'm', 'b'].indexOf(k) > -1)
    .sort()
    .forEach((k) => {
      returnQuery[k] = query[k];
    });
  return returnQuery;
}

function generateKey(imagePath, query) {
  let key = imagePath;
  const keys = Object.keys(query);
  if (query && keys.length > 0) {
    key += '?';
    keys.sort().forEach((k, i) => {
      key += `${k}=${query[k]}`;
      if (i !== keys.length - 1) key += '&';
    });
  }
  if (key[0] === '/') key = key.substring(1);
  return key;
}


function resize(data) {
  const lambda = new AWS.Lambda({ region: process.env.region });
  return new Promise((resolve, reject) => lambda.invoke({
    Payload: JSON.stringify(data),
    FunctionName: process.env.RESIZE_LAMBDA,
  }, (err, result) => {
    if (err) {
      return reject(err);
    }
    if (result.FunctionError) {
      return reject({ statusCode: 502, body: result.Payload });
    }
    return resolve(result);
  }));
}

function processImage(imagePathArg, query, destinationPath) {
  const imagePath = (imagePathArg[0] === '/') ? imagePathArg.substring(1) : imagePathArg;
  return checkS3(imagePath)
    .then((metadata) => {
      if (!metadata) throw Errors.NOT_FOUND;
      console.log('s3 base', imagePath, 'exists but we need to process it into', destinationPath);
      const lambdaData = {
        mime_type: metadata.ContentType,
        resize_options: parseQueryParameters(query),
        asset: imagePath,
        destination: destinationPath,
        bucket: process.env.BUCKET,
        storage_class: 'REDUCED_REDUNDANCY',
      };
      console.log(JSON.stringify(lambdaData));

      return resize(lambdaData);
    })
    .then(() => getS3(destinationPath));
}

module.exports.handler = (event, context, callback) => {
  const query = stripQueryParams(event.queryStringParameters);
  const key = generateKey(event.path, query);
  console.log(key);
  return checkS3(key)
    .then((metadata) => {
      if (metadata) return getS3(key).then(data => callback(null, data));
      else if (Object.keys(query).length > 0) {
        return (
          processImage(event.path, event.queryStringParameters, key)
            .then(data => callback(null, data))
        );
      }
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
