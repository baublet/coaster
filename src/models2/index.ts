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

type PropertyRequired<T extends boolean | undefined> = T extends
  | false
  | undefined
  ? undefined
  : never;

type PropertiesFromModelArgs<Args extends ModelArgs> = Partial<
  {
    [K in keyof Args["properties"]]: PropertyType<
      Args["properties"][K]["type"]
    >;
  }
>;

type RequiredPropertyFromPropertyArgs<
  P extends string | number | symbol,
  Args extends ModelArgsPropertyArgs
> = Args["required"] extends true ? P : never;

type RequiredPropertiesFromModelArgs<Args extends ModelArgs> = Required<
  ObjectWithoutNeverProperties<
    {
      [P in keyof Args["properties"]]: RequiredPropertyFromPropertyArgs<
        P,
        Args["properties"][P]
      >;
    }
  >
>;

type ComputedPropsFromModelArgs<Args extends ModelArgs> = {
  [K in keyof Args["computedProperties"]]: ReturnType<
    Args["computedProperties"][K]
  >;
};

type ModelHasRelationshipsFromModelArgs<Args extends ModelArgs> = {
  [K in keyof Args["has"]]: ReturnType<Args["has"][K]["modelFactory"]>;
};

type Model<Args extends ModelArgs> = PropertiesFromModelArgs<Args> &
  RequiredPropertiesFromModelArgs<Args> &
  ComputedPropsFromModelArgs<Args>;

type ModelFactory<Args extends ModelArgs> = () => Model<Args>;

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
    test: {
      type: ModelArgsPropertyType.STRING
    },
    test2: {
      type: ModelArgsPropertyType.NUMBER,
      required: true
    }
  },
  computedProperties: {
    test2Computed: props => props.test + " Computed!"
  }
});

type User = ReturnType<typeof User>;
