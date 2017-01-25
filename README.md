# Bite Service

## Getting Started

### Clone this repository

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
