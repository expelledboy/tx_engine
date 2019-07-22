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
	"http://${HOST}:3000/api/transaction" \
	-d "$TRX"

