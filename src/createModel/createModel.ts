interface ModelDefinition {
  names: {
    singularCamel: string;
    singularPascal: string;
    pluralCamel: string;
    pluralPascal: string;
  };
  properties: Record<string, ModelPropertyDefinition>;
}

type ModelPropertyDefinition =
  | ModelPropertyStringDefinition
  | ModelPropertyNumberDefinition
  | ModelPropertyBooleanDefinition
  | ModelPropertyDateDefinition
  | ModelPropertyOneToOneDefinition
  | ModelPropertyManyToOneDefinition
  | ModelPropertyOneToManyDefinition
  | ModelPropertyManyToManyDefinition;

interface CommonModelPropertyDefinition {
  required?: boolean;
}

interface ModelPropertyStringDefinition extends CommonModelPropertyDefinition {
  type: "string";
  default?: string;
}

interface ModelPropertyNumberDefinition extends CommonModelPropertyDefinition {
  type: "number";
  default?: number;
}

interface ModelPropertyBooleanDefinition extends CommonModelPropertyDefinition {
  type: "boolean" | "bool";
  default?: boolean;
}

interface ModelPropertyDateDefinition extends CommonModelPropertyDefinition {
  type: "date";
  default?: Date;
}

interface ModelPropertyOneToOneDefinition
  extends CommonModelPropertyDefinition {
  type: "one-to-one";
  modelFactory: ModelFactory;
  default?: ModelDefinition;
}

interface ModelPropertyManyToOneDefinition
  extends CommonModelPropertyDefinition {
  type: "many-to-one";
  modelFactory: ModelFactory;
  options: {
    referenceFieldName: string;
    referenceModelKey?: string;
    cascade?: boolean;
  };
}

interface ModelPropertyOneToManyDefinition
  extends CommonModelPropertyDefinition {
  type: "one-to-many";
  modelFactory: ModelFactory;
  options: {
    referenceFieldName: string;
    localModelKey: string;
    cascade?: boolean;
  };
}

interface ModelPropertyManyToManyDefinition
  extends CommonModelPropertyDefinition {
  type: "one-to-many";
  modelFactory: ModelFactory;
  options: {
    joinModel: ModelDefinition;
    cascade?: boolean;
  };
}

type InertModelDefinition = {
  names: {
    pluralCamel: "coaster";
    pluralPascal: "coaster";
    singularCamel: "coaster";
    singularPascal: "coaster";
  };
  properties: {};
};

interface ModelFactory<
  TModelOptions extends ModelDefinition = InertModelDefinition
> {
  model: ModelFromDefinition<TModelOptions>;
}

type ModelPropertyTypeLiteralToType<
  T extends ModelPropertyDefinition["type"]
> = T extends "string"
  ? string
  : T extends "number"
  ? number
  : T extends "boolean"
  ? boolean
  : T extends "bool"
  ? boolean
  : T extends "date"
  ? Date
  : never;

type ModelFromDefinition<TModelOptions extends ModelDefinition> = {
  [K in keyof TModelOptions["properties"]]: ModelPropertyTypeLiteralToType<
    TModelOptions["properties"][K]["type"]
  >;
};

function createModel<TModelOptions extends ModelDefinition>(
  args: ModelDefinition
): ModelFactory<TModelOptions> {
  return "" as any;
}

const AccountModel = createModel({
  names: {
    pluralCamel: "accounts",
    pluralPascal: "Accounts",
    singularCamel: "account",
    singularPascal: "Account",
  },
  properties: {
    id: {
      type: "string",
    },
    user: {
      type: "one-to-one",
      modelFactory: UserModel,
    },
  },
});

const UserModel = createModel({
  names: {
    pluralCamel: "users",
    pluralPascal: "Users",
    singularCamel: "user",
    singularPascal: "User",
  },
  properties: {
    id: {
      type: "string",
    },
    numeric: {
      type: "number",
    },
    flag: {
      type: "bool",
    },
    relationship: {
      type: "one-to-one",
      modelFactory: AccountModel,
    },
  },
});
