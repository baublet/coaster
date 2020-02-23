import user from "../../integration/todo/models/user";
import { ModelRelationshipArguments } from "model/types";

type ObjectWithoutNeverProperties<
  O extends Record<string | number | symbol, any>
> = Pick<
  O,
  {
    [K in keyof O]: O[K] extends never ? never : K;
  }[keyof O]
>;

enum ModelArgsPropertyType {
  BOOLEAN,
  STRING,
  NUMBER,
  COMPUTED,
  RELATIONSHIP
}

type ModelArgsRegularPropertyArgs = {
  type:
    | ModelArgsPropertyType.BOOLEAN
    | ModelArgsPropertyType.STRING
    | ModelArgsPropertyType.NUMBER;
  required?: boolean;
};

type ModelArgsComputedPropertyArgs = {
  type: ModelArgsPropertyType.COMPUTED;
  compute: (obj: any) => any;
};

type ModelArgsRelationshipPropertyArgs = {
  type: ModelArgsPropertyType.RELATIONSHIP;
  modelFactory: ModelFactory;
  many?: boolean;
  localKey?: string;
  foreignKey?: string;
};

type ModelArgsPropertyArgs =
  | ModelArgsRegularPropertyArgs
  | ModelArgsComputedPropertyArgs
  | ModelArgsRelationshipPropertyArgs;

interface ModelArgs {
  properties: {
    [key: string]: ModelArgsPropertyArgs;
  };
  has?: {
    [key: string]: {
      modelFactory: ModelFactory<ModelArgs>;
      many?: boolean;
    };
  };
}

type PropertyType<
  Args extends ModelArgsPropertyArgs
> = Args["type"] extends ModelArgsPropertyType.STRING
  ? string
  : Args["type"] extends ModelArgsPropertyType.BOOLEAN
  ? boolean
  : Args["type"] extends ModelArgsPropertyType.NUMBER
  ? number
  : Args extends ModelArgsComputedPropertyArgs
  ? () => ReturnType<Args["compute"]>
  : Args extends ModelArgsRelationshipPropertyArgs
  ? Args["modelFactory"][]
  : never;

type PropertiesFromModelArgs<Args extends ModelArgs> = Partial<
  {
    [K in keyof Args["properties"]]: PropertyType<Args["properties"][K]>;
  }
>;

type RequiredPropertyFromPropertyArgs<
  Args extends ModelArgsPropertyArgs
> = Args extends ModelArgsRegularPropertyArgs
  ? Args["required"] extends true
    ? PropertyType<Args>
    : never
  : never;

type ReadOnlyPropertiesFromModelArgs<
  Args extends ModelArgs
> = ObjectWithoutNeverProperties<
  {
    readonly [P in keyof Args["properties"]]: Args["properties"][P] extends ModelArgsComputedPropertyArgs
      ? PropertyType<Args["properties"][P]>
      : never;
  }
>;

type RequiredPropertiesFromModelArgs<Args extends ModelArgs> = Required<
  ObjectWithoutNeverProperties<
    {
      [P in keyof Args["properties"]]: RequiredPropertyFromPropertyArgs<
        Args["properties"][P]
      >;
    }
  >
>;

type ModelHasRelationshipFromModelArgs<
  Args extends ModelArgsPropertyArgs
> = Args extends ModelArgsRelationshipPropertyArgs
  ?PropertyType<Args>
  : never;

type ModelHasRelationshipsFromModelArgs<Args extends ModelArgs> = {
  readonly [K in keyof Args["properties"]]: ObjectWithoutNeverProperties< ModelHasRelationshipFromModelArgs<
    Args["properties"][K]
  >>;
};

type ModelFactoryArgsFromModelArgs<
  Args extends ModelArgs
> = PropertiesFromModelArgs<Args> & RequiredPropertiesFromModelArgs<Args>;

type Model<Args extends ModelArgs> = PropertiesFromModelArgs<Args> &
  RequiredPropertiesFromModelArgs<Args> &
  ModelHasRelationshipsFromModelArgs<Args> &
  // This must come last because it marks existing things as ReadOnly
  ReadOnlyPropertiesFromModelArgs<Args>;

type ModelFactory<Args extends ModelArgs = any> = (
  initialValue: ModelFactoryArgsFromModelArgs<Args>
) => Model<Args>;

function createModel<T extends ModelArgs>(opts: T): ModelFactory<T> {
  return {} as any;
}

const Todo = createModel({
  properties: {
    name: {
      type: ModelArgsPropertyType.STRING
    }
  }
});

type Todo = ReturnType<typeof Todo>;

const User = createModel({
  properties: {
    firstName: {
      type: ModelArgsPropertyType.STRING,
      required: true
    },
    lastName: {
      type: ModelArgsPropertyType.STRING,
      required: true
    },
    employeeId: {
      type: ModelArgsPropertyType.NUMBER,
      required: true
    },
    about: {
      type: ModelArgsPropertyType.STRING
    },
    todo: {
      type: ModelArgsPropertyType.RELATIONSHIP,
      modelFactory: Todo
    },
    name: {
      type: ModelArgsPropertyType.COMPUTED,
      compute: props => props.firstName + " " + props.lastName
    }
  }
});

type User = ReturnType<typeof User>;

const mike = User({
  firstName: "Michael",
  lastName: "Yawanis",
  employeeId: 123456789
})

