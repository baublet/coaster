# `generateORM`

The core of Coaster is `generateORM`. It does the following:

- Runs our schema fetcher (these are declared in `generateORM/drivers`)
- Passes the result of the schema fetcher through our generators (`generateORM/generators`)
- Passes the resulting generated code to post-processors (`generateORM/postProcessors`)
- Returns the final resulting code

## Schema Fetchers

Schema fetchers take a knex connection and returns/resolves an array of `RawSchema` for later processing. The implementation details for how this is done will vary drastically depending on the underlying driver.

## Generators

Generators take a `RawSchema` and `MetaData` objects and return a string of generated code.

## Post-Processors

Post-processors take the final result of generated code and return a new string of generated code, discarding the previous result. Post-processors are useful appending headers/footers, or running code through opinionated code formatters like Prettier.
