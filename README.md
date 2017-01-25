# Bite Service

## Getting Started

### Clone this repository

* Run `git clone https://github.com/mschilling/bite-service.git` (or ssh)

### Install dependencies

* Run `npm install`

### Setup environment file

* Create empty file `.env` (or copy `sample.env`)

( Using `dotenv` npm package [https://www.npmjs.com/package/dotenv](https://www.npmjs.com/package/dotenv) )

* The following ENV parameters should be set:

```
NODE_ENV=<development|acceptance|orwhatever>
FCM_AUTH_KEY=<FCM Authentication Key>
FCM_TEST_TOKEN=<FCM Debug token>
FIREBASE_DB_URL=<FB Database Url>
FIREBASE_SERVICE_ACCOUNT=<FB path to service account .json>
```

## Run Service

If you want to run the service locally, just type the following command:

`node ./service.js`

Or, even beter, install `nodemon` (npm package) globally and run

`nodemon ./service.js`

Nodemon will automatically re-run the node application when a file in the workspace has been changed
