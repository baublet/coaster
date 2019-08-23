A rails-like framework for Node.

# ORM

```js

interface UserProps {
  firstName: string,
  lastName: string
}

const UserModel = createModel({
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
    id: {
      type: ModelType.id,
      unique: true,
      primaryKey: true,
      unique: true
    },

    // Text
    firstName: ModelType.text,
    lastName: {
      type: ModelType.text,
      unique: true,
      nullable: false
    },

    // Numerics
    pointBalance: ModelType.int,
    floatThing: ModelType.float,

    // Cross-model relationships
    transactionAccount: {
      type: ModelType.model,
      model: TransactionAccountModel,
      // Load relationships eagerly by default to prevent n+1 problems.
      // This is false by default.
      eager: true
    },
    purchases: {
      type: ModelType.models,
      model: PurchaseModel
    }
  },

  // Computed props that are not persisted to the database
  computedProperties: {
    fullName: data => `${data.firstName} ${data.lastName}`
  }
});
```
