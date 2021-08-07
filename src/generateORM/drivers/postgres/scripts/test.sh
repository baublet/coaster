#!/bin/bash

SRC_PATH=src/generateORM/drivers/postgres

echo "Starting PG"
(cd $SRC_PATH; docker-compose up -d) || exit

echo "Waiting for PG to start"
while ! nc -z 127.0.0.1 54311; do sleep 1; done;

echo "(Re)Creating databases"
(cd $SRC_PATH; yarn ts-node src/generateORM/drivers/postgres/scripts/dropDatabase.ts) || exit
(cd $SRC_PATH; yarn ts-node src/generateORM/drivers/postgres/scripts/createDatabase.ts) || exit

echo "Migrating"
yarn ts-node node_modules/.bin/knex --knexfile "$SRC_PATH/knexfile.js" --migrations-directory "$SRC_PATH/migrations" migrate:latest || exit

(cd $SRC_PATH; yarn test:integration postgres.integration.test.ts)
