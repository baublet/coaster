#!/bin/bash

SRC_PATH=src/generateORM/integrationTests

echo "Starting PG"
(cd $SRC_PATH; docker-compose up -d) || exit

echo "Waiting for PG to start"
while ! nc -z 127.0.0.1 54311; do sleep 1; done;

echo "(Re)Creating databases"
(cd $SRC_PATH; yarn ts-node src/generateORM/integrationTests/scripts/dropDatabase.ts) || (cd $SRC_PATH; docker-compose down); exit 1
(cd $SRC_PATH; yarn ts-node src/generateORM/integrationTests/scripts/createDatabase.ts) || (cd $SRC_PATH; docker-compose down); exit 1

echo "Migrating"
yarn ts-node node_modules/.bin/knex --knexfile "$SRC_PATH/knexfile.js" --migrations-directory "$SRC_PATH/migrations" migrate:latest || (cd $SRC_PATH; docker-compose down); exit 1

if (cd $SRC_PATH; yarn test:integration postgres.orm.integration.test.ts); then
  (cd $SRC_PATH; docker-compose down)
  exit 0
else
  (cd $SRC_PATH; docker-compose down)
  exit 1
fi
