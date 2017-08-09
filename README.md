Serverless-Image-Resizer [![Build Status][travis-image]][travis-url] [![NPM version][npm-image]][npm-url]
========================

Serverless-Image-Resizer is an image processing service that runs on AWS Lambda and S3.

# Summary

Put simply, Serverless-Image-Resizer works by requesting an image file from S3 and applying image
processing functions to that image.

# Setup

## AWS and Serverless

This project relies on AWS + The [Serverless Framework](https://github.com/serverless/serverless)
to deploy and manage your service. If it is not already, install serverless globally:

```sh
$ npm install -g serverless
```

You will need an AWS account to deploy this service. If you do not already have one, sign up at
https://aws.amazon.com

You will need AWS credentials to programmatically deploy your service from the commandline. Follow
the [Serverless AWS Credentials documentation](https://serverless.com/framework/docs/providers/aws/guide/credentials/)
to get setup.

## Code

There are two ways to get the project code, choose from one of the options:
1. Clone the project and deploy from that project directory
2. npm install the module and incorporate it into your own project

### Clone

```sh
$ git clone https://github.com/nicholasgubbins/Serverless-Image-Resizer.git && cd Serverless-Image-Resizer
$ npm i
```

### npm

In your project directory, npm install the node module and the browserify serverless plugin:

```sh
$ npm install --save serverless-image-resizer
$ npm install --save-dev serverless-plugin-browserify
```

You can change where the function handlers live by editing `functions.FUNCTION_NAME.handler` in
`serverless.yml`, but using the paths that are there now, you would use `serverless-image-resizer`
by creating the files below:

```js
// in functions/resizeImage/index.js
const { resizeImage } = require('serverless-image-resizer');

module.exports.handler = resizeImage.handler;


// in functions/resizeImage/index.js
const { getImage } = require('serverless-image-resizer');

module.exports.handler = getImage.handler;
```

## Rename the S3 bucket

In `serverless.yml` change `provider.environment.BUCKET` to be the name of your S3 bucket.

## Deploy the service

Using serverless, deploy the service from the top level of the project:

```sh
$ sls deploy
```

## API Gateway Binary Support

Currently, there is no way to configure Binary Support using serverless (related [serverless issue](https://github.com/serverless/serverless/issues/2797)).
For now we can set this manually using the AWS Console:
1. Open the AWS Console
2. Click the API Gateway Service
3. Click on your service in the left sidebar
4. Click "Binary Support"
5. Click the "Edit" button on the right side of the page
5. Add `*/*` to the text input and click "Save"
6. Click on your service in the left sidebar
7. The "Actions" dropdown button should have an orange dot next to it, click on the "Actions" button.
8. Click on "Deploy API" in the dropdown menu
9. Select the "dev" service (or another service if you have configured one)
10. Click the "Deploy" button

## You're done!

Once you've reach this point your service is ready to use.

You can run `$ sls info` to print out the details about your service. You should see one "endpoint"
that has a `GET` method. Copy this URL and paste it into your browser. Replace `{proxy+}` with a
path to one of your images in S3 (omitting the `BUCKET_NAME` defined in `serverless.yml`). For
example:

```
https://LAMBDA-ID.execute-api.eu-west-1.amazonaws.com/dev/path/to/image.png
```

# Usage

Serverless-Image-Resizer supports the following query params:

| Parameter | Description | Format | Example |
| --- | --- | --- | --- |
| w | width   | number | `?w=150` |
| h | height  | number | `?h=200` |
| w&h | crop | number | `?w=150&h=200` |
| f | filter  | string | `?q=Point` |
| q | quality | number | `?q=2` |
| m | max     | number | `?m=3` |
| b | blur    | numberxnumber | `?b=0x7` |

For example:

```
https://LAMBDA-ID.execute-api.eu-west-1.amazonaws.com/dev/path/to/image.png?w=100&h=200&b=0x3
```

# Development

AWS Lambda
[supports node 6.10.2](http://docs.aws.amazon.com/lambda/latest/dg/current-supported-versions.html)
so that should be used during development. If you have [`nvm`](https://github.com/creationix/nvm)
installed you can run `$ nvm use` to use the version in the `.nvmrc` file.

## Testing

Tests are written and executed using [Jest](https://facebook.github.io/jest/). To write a test,
create a `FILE_NAME.spec.js` file and Jest will automatically run it when you execute the test
command:

```sh
$ npm test
$ npm run test:watch     # to test as you develop
$ npm run test:coverage  # to test code coverage
```

Note that `npm run test:coverage` will create a `coverage` folder that is gitignored.

**TODO:**
* Documention
  * Summary
  * Setup
  * gh-pages
* Add LICENSE
* Add PULL_REQUEST_TEMPLATE
* Add CONTRIBUTING
* Mock lambda, s3 and gm for testing
* ~Bump serverless node version to 6.10.2~
* ~add .nvmrc set to 6.10.2~
* Integrate with CI
* Setup cloudwatch logs in serverless.yml

[travis-image]: https://travis-ci.org/nicholasgubbins/Serverless-Image-Resizer.svg?branch=master
[travis-url]: https://travis-ci.org/nicholasgubbins/Serverless-Image-Resizer
[npm-image]: https://badge.fury.io/js/serverless-image-resizer.svg
[npm-url]: https://npmjs.org/package/serverless-image-resizer
