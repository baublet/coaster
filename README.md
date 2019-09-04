A Rails-like framework for Node optimized for developer happiness. At its heart, Coaster is a Model/Controller framework for quickly building performant, easy-to-maintain applications.

# Features

- [ ] A fully-featured ORM
  - [ ] Validations
  - [ ] Computed properties
  - [ ] Cross-model relations
    - [ ] Eager loading
    - [ ] Lazy loading
  - [ ] Schema and schema-less support
  - [ ] Out of the box support for:
    - [ ] In-memory store
    - [ ] SQLite
    - [ ] Postgres
  - [ ] Automatic migrations workflow
  - [ ] Manual migrations workflow
- [ ] Easy server setup
  - [ ] Unified Controller convention
  - [ ] REST server
  - [ ] GraphQL server

# Todo List

- Models
  - [ ] Validations against schema
    - [ ] All data types (& test it)
  - [ ] Automatic DB schema generation
    - [ ] Tables
    - [ ] Columns
  - Application configuration
    - [ ] Need a way for our CLI script to know where to find DB connections
  - Migrations
    - [ ] Standardization
      - [ ] Where migration scripts live
      - [ ] Where migration table lives in the persist engine
    - [ ] Schema diffing for automated migration generation
      - [ ] Implement diff algorithm
      - [ ] Implement diff-to-migration algorithm
    - [ ] CLI tool `coaster migrate`
      - [ ] Write the basics of it
      - [ ] Write up/down scripts
      - [ ] Write generate script
