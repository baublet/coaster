import user from "../../integration/todo/models/user";

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
  NUMBER
}

type ModelArgsPropertyArgs = {
  type: ModelArgsPropertyType;
  required?: boolean;
};

interface ModelArgs {
  properties: {
    [key: string]: ModelArgsPropertyArgs;
  };
  computedProperties?: {
    [key: string]: (properties: ModelArgs["properties"]) => any;
  };
  has?: {
    [key: string]: {
      modelFactory: ModelFactory<ModelArgs>;
      many?: boolean;
    };
  };
}

type PropertyType<
  T extends ModelArgsPropertyType
> = T extends ModelArgsPropertyType.STRING
  ? string
  : T extends ModelArgsPropertyType.BOOLEAN
  ? boolean
  : T extends ModelArgsPropertyType.NUMBER
  ? number
  : never;

type PropertiesFromModelArgs<Args extends ModelArgs> = Partial<
  {
    [K in keyof Args["properties"]]: PropertyType<
      Args["properties"][K]["type"]
    >;
  }
>;

type RequiredPropertyFromPropertyArgs<
  P extends ModelArgsPropertyType,
  Args extends ModelArgsPropertyArgs
> = Args["required"] extends true ? PropertyType<P> : never;

type RequiredPropertiesFromModelArgs<Args extends ModelArgs> = Required<
  ObjectWithoutNeverProperties<
    {
      [P in keyof Args["properties"]]: RequiredPropertyFromPropertyArgs<
        Args["properties"][P]["type"],
        Args["properties"][P]
      >;
    }
  >
>;

type ComputedPropsFromModelArgs<Args extends ModelArgs> = {
  readonly [K in keyof Args["computedProperties"]]: () => ReturnType<
    Args["computedProperties"][K]
  >;
};

type ModelHasRelationshipsFromModelArgs<Args extends ModelArgs> = {
  [K in keyof Args["has"]]: ReturnType<Args["has"][K]["modelFactory"]>;
};

type ModelFactoryArgsFromModelArgs<
  Args extends ModelArgs
> = PropertiesFromModelArgs<Args> & RequiredPropertiesFromModelArgs<Args>;

type Model<Args extends ModelArgs> = PropertiesFromModelArgs<Args> &
  RequiredPropertiesFromModelArgs<Args> &
  ComputedPropsFromModelArgs<Args>;

type ModelFactory<Args extends ModelArgs> = (
  initialValue: ModelFactoryArgsFromModelArgs<Args>
) => Model<Args>;

function createModel<T extends ModelArgs>(opts: T): ModelFactory<T> {
  return {};
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
    }
  },
  computedProperties: {
    name: props => props.firstName + " " + props.lastName
  }
});

type User = ReturnType<typeof User>;

const mike = User({
  firstName: "Michael",
  lastName: "Yawanis",
  employeeId: 123456789,
  about: "Test!"
});

mike;
