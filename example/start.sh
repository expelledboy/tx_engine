#!/bin/bash

source .env
docker-compose up --exit-code-from api
