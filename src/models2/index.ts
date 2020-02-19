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

type ModelArgs = {
  properties: {
    [key: string]: ModelArgsPropertyArgs;
  };
  computedProperties: {
    [key: string]: () => any;
  };
};

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

// PropertiesFromModelArgs<Args>

type Model<Args extends ModelArgs> = PropertiesFromModelArgs<Args> &
  RequiredPropertiesFromModelArgs<Args>;

function createModel<T extends ModelArgs>(opts: T): Model<T> {
  return {};
}

const user = createModel({
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
    test2: () => "test 2"
  }
});

user;
