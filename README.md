![Publish Docker image](https://github.com/Borales/actions-yarn/workflows/Publish%20Docker%20image/badge.svg)

# Coaster

A framework for generating lightweight, horizontally-scalable web applications using TypeScript and GraphQL.

## Naming

`?(*.)schema.gql` - schema files, where you declare this application's schema
`*.(query|mutation).gql` - query/mutation files, where you consume this application's schema

## IDEA

- Power up and configure the droplet
- While they use it, it's good to go
- When they power down, TAKE A SNAPSHOT, then destroy it
- When they power back up, power up the snapshot
