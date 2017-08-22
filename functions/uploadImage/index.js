

const AWS = require('aws-sdk');

const s3 = new AWS.S3();

const v4 = require('uuid').v4;

function generateUploadParams(content_type, extension, key){
  return {
    Bucket: process.env.S3_BUCKET,
    Key: `${process.env.NODE_ENV}/${(key) ? key : v4()}${extension}`,
    ContentType: content_type,
    ACL: 'public-read'
  }
}

module.exports.handler = (event, context, callback) => {
    let query = (event.queryStringParameters) ? event.queryStringParameters : event;
    let extension = /^\.\w*$/.test(query.extension) ? query.extension : (typeof query.extension != 'undefined') ? `.${query.extension}` : ".undefined";
    let key = (query.key) ? query.key : null;
    let content_type = query.content_type;
    if (!content_type) return callback(null, {statusCode:400, body: JSON.stringify({message:'please provide a content_type and extension'})});
    s3.getSignedUrl('putObject', generateUploadParams(content_type, extension, key), function (error, url) {
        if(error) return callback(null, {statusCode:error.statusCode || 500, body:JSON.stringify({message:error.message})});
        else callback(null, {statusCode:200, body:JSON.stringify({url:url})});
    });
}

module.exports.generateUploadParams = generateUploadParams;