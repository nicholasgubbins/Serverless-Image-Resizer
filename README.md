Image-Resizer
======

Image-Resizer is an image processing service that runs on AWS Lambda and S3.

# Summary

Put simply, Image-Resizer works by requesting an image file from S3 and applying image processing
functions to that image.

# Setup

Get AWS Credentials (limited scope).

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
