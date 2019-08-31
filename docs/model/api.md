# Model API

## createModel(): ModelFactory

Returns a factory for instantiating a new model type given a payload of initial data.

```ts
createModel<ModelProperties, ModelComputedProperties>({
  name,
  validators = [],
  computedProps = {},
  schema = {},
  persistWith
}): ModelFactory
```

*required* `name: string`: the name of your new model. This is entirely an internal model for your own reference. We do not use it internally.

`validators: [(data: ModelData, computedProps: Record<string, ComputedPropFunction>) => true | string]`: an array of model validators.

`computedProps: <Record: string, (data: ModelData) => any>`: a map of computed props to generate from the internal model data.

`schema: ModelSchemaOptions`: a schema of your model's data.

`persistWith: PersistAdapter`: persistence layer to associate with this model.

### Type Safety

We ensure type safety of all of your models so long as you pass through your data models into the model factory function, e.g.

```ts
interface UserModelData {
  firstName: string;
  lastName: string;
  email: string;
}

interface UserModelComputedProps {
  name: string;
}

const userModel<UserModelData, UserModelComputedProps>({
  name: "user"
});

const angela = userModel({
  firstName: "Angela",
  lastName: "Daniels",
  email: "test@testerson.com"
});

// `angela` will only allow access to name, firstName, lastName, and email,
// as well as the default internals we set.
```

## ModelFactory

Returns a new model instantiated with `initialValue`, the types you specified in the `createModel` function call

```ts
(initialValue: T = {} as T): Model<T & C> => Model
```
