#!/bin/bash

source .env
source gen_type.sh

read -r -d '' TRX <<EOF
{
  "trx_id": "$(uuidgen)",
  "meta": {"type":"$trx_type"},
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
