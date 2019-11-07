#!/bin/ash

ACTION_DIR=${ACTION_DIR:-/actions}
PACKAGES=$ACTION_DIR/package.json

if [ -f $PACKAGES ]; then
	cd $ACTION_DIR
	echo "==> Installing action dependancies"
	npm install
else
	echo "==> Actions do not require dependancies"
fi
