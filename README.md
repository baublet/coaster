A rails-like framework for Node.

# ORM

```js
interface UserProps {
  firstName: string;
  lastName: string;
  transactionAccount: ModelRelation<TransactionAccountProps>;
}

interface TransactionAccountProps {
  user: ModelRelation<UserProps>;
  balance: number;
}

const UserModel = createModel<UserProps>({
  name: "User",

  // Validators are simple functions that take the internal model data
  // and return either true if it's valid, or a string for the error if
  // it's invalid.
  //
  // (data) => data.id ? true : "You need an ID!";
  //
  validators: [],

  schema: {
    // IDs are included in every schema unless you override it
    id: ModelType.id,
    createdAt: ModelType.date,
    updatedAt: ModelType.date,

    // Text
    firstName: ModelType.text,
    lastName: ModelType.text,

    // Numerics
    pointBalance: ModelType.int,
    floatThing: ModelType.float,

    // Cross-model relationships
    transactionAccount:
      modelRelation<TransactionAccountProps>(TransactionAccountModel)
  },

  // Computed props that are not persisted to the database
  computedProperties: {
    fullName: data => `${data.firstName} ${data.lastName}`
  }
});
```
