#!/bin/bash

source .env
source gen_type.sh

read -r -d '' TRX <<EOF
{
  "type":"$trx_type",
  "limit": 3,
  "skip": 1
}
EOF

curl -v \
	-u system:secret \
	-H 'content-type: application/json'\
	"http://localhost:3000/api/transaction/query" \
	-d "$TRX"
