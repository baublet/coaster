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

  validators: [(data) => data.firstName ? true : "You need a first name!"],

  schema: {
    // These are our default props
    id: SchemaNodeType.id,
    createdAt: SchemaNodeType.date,
    updatedAt: SchemaNodeType.date,

    // Text
    firstName: SchemaNodeType.text,
    lastName: SchemaNodeype.text,

    // Numerics
    pointBalance: SchemaNodeType.int,
    floatThing: SchemaNodeType.float,

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
