[![CI](https://github.com/baublet/coaster/actions/workflows/continuous-testing.yml/badge.svg)](https://github.com/baublet/coaster/actions/workflows/continuous-testing.yml)

- [ ] replace inline-templates with the template system
- [ ] 100% coverage for postgres
- [ ] mysql driver
- [ ] relational CRUD

# Coaster

A library for generating light-weight Object-Relational Mappers using Knex and TypeScript.

## Command-line interface

The majority of users will interface with Coaster via the command line. Any project with a `knexfile.js` in it (or rough equivalent) can benefit from Coaster generating some or all of its ORM.

```sh
$ coaster generate
```

By default, this command will read your project's `knexfile.js`, connect to the database therein, and generate a file called `generated.ts` next to your knex file that will contain all of the provided functions you might need to manage your data.

Working with Coaster involves using its generated as a base for writing your own business logic. You import generated code, write your own business logic, and let Coaster handle reading and mutating your data using its pre-generated, type-safe, and well-tested functions.

```ts
// insertUsers.ts
import {
  insertUsers as baseInsertUsers,
  UserInput,
  User,
  ConnectionOrTransaction,
} from "./generated";
import { fireEvent } from "./eventSystem";

export async function insertUsers(
  users: UserInput[],
  connection: ConnectionOrTransaction
): Promise<User[]> {
  const users = await baseInsertUsers(users, connection);
  await fireEvent("usersCreated", { users });
  return users;
}
```

For the most ergonomic developer experience, we suggest wrapping all of Coaster's generated code in your own set of wrappers.

```ts
// db.ts
import * as generatedOrm from "./generated";
import { insertUsers } from "./insertUsers";

export const getConnection = knex();

export {
  ...generatedOrm,
  getConnection,
  insertUsers
}

// graphql/resolvers/createUsersMutation
import { insertUsers, findUserOrFail, UserInput, getConnection, User } from "./db";

// Later, if you want to add logic to findUser, you can wrap it in the same way
// we wrapped `insertUsers` above

export async function createUsersMutation(
  parent: unknown,
  args: { input: UserInput[], returningUserKey: string }
): Promise<User> {
  const createdUsers = await insertUsers(args.input, getConnection());
  return findUserOrFail(u => u.where("key", "=", args.returningUserKey ));
}

```

## Deployment

Coaster ties your code to the shape of your database. Thus, there are two possible deployment workflows:

### Building code at server start time

In your deployment process, _after you have run your database migrations_, you can have Coaster generate your code before booting up the server.

Pros

- Fewer connections to manage
- Fewer points of potential failure in the deployment process
- Ensures your code matches your production database

Cons

- Slower container boot times (as slow as the underlying Coaster database driver)

### Building code at container/project build time against a test database

In your code building process, you can migrate a test database within/connected to a container that Coaster can generate code against.

Pros

- Containers are tied to a specific version of your database
- Coaster adds no overhead to your container start time
- Know sooner if your code and database don't match (at container build time)

Cons

- More complex build process
