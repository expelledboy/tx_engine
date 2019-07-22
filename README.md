txjs
====

Dynamic nodejs transaction processing engine with REST api

## Getting Started

Create a collection of actions with the following interface:

$ cat example/actions/log.js
```js
function execute(context, cb) {
  console.log({ context });
  cb(null, true);
}

function unexecute(context, error, cb) {
  console.log({ context, error });
  cb(null, true);
}

module.exports = {
  name: 'log',
  execute,
  unexecute,
}
```

Mount these to `/actions` in the `expelledboy/txjs` docker image:

$ cat example/docker-compose.yml
```yml
version: '3.4'

services:

  mongo:
    image: mongo:latest
    restart: always
    volumes:
      - data:/data/db
    ports:
      - 27017:27017

  api:
    image: expelledboy/txjs
    ports:
      - 3000:3000
    volumes:
      - ./actions:/actions
    depends_on:
      - mongo
    environment:
      - NODE_ENV=production
      - SYSTEM_PASSWORD=secret
      - DEBUG=tx:*
    command:
      npm start

volumes:
  data:
```

Send a transaction specification to the REST API:

$ cat example/test.sh
```sh
#!/bin/bash

source .env

read -r -d '' TRX <<EOF
{
  "trx_id": "$(uuidgen)",
  "actions": [
    {"name":"log","params":{"data":true}}
  ]
}
EOF

curl -v \
	-u system:secret \
	-H 'content-type: application/json'\
	"http://localhost:3000/api/transaction" \
	-d "$TRX"
```

The `Transaction` object must have a `trx_id` and a list of `actions`.

Each `Action` should have a `name` which matches those installed, and `params`.

The `params` can also include key value pairs that allow introspection into results
of actions already executed in the transaction.

Lets take the following `Transaction` specification:

```json
{
  "trx_id": "40863B4E-8BC8-4C35-9425-2C01D58EC5B3",
  "actions": [
    {"name":"get_accounts","params":{}},
    {"name":"check_balance","params":{}},
    {"name":"get_accounts","params":{}},
    {"name":"pay","params":{"$from_account":"$.get_accounts[1].accounts[0]"}}
  ]
}
```

Where we are on the last step 'pay', where 'get_accounts' resolved twice with the result:

```json
{
  "accounts": [
    "loan",
    "cheque"
  ]
}
```

The `params` passed to the pay action will be:

```json
{
  "from_account": "loan"
}
```
