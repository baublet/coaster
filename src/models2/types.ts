export type ObjectWithoutNeverProperties<
  O extends Record<string | number | symbol, any>
> = Pick<
  O,
  {
    [K in keyof O]: O[K] extends never ? never : K;
  }[keyof O]
>;

export enum ModelArgsPropertyType {
  BOOLEAN,
  STRING,
  NUMBER,
  COMPUTED,
  RELATIONSHIP
}

export type ModelArgsRegularPropertyArgs = {
  type:
    | ModelArgsPropertyType.BOOLEAN
    | ModelArgsPropertyType.STRING
    | ModelArgsPropertyType.NUMBER;
  required?: boolean;
};

export type ModelArgsComputedPropertyArgs = {
  type: ModelArgsPropertyType.COMPUTED;
  compute: (obj: any) => any;
};

export type ModelArgsRelationshipPropertyArgs = {
  type: ModelArgsPropertyType.RELATIONSHIP;
  modelFactory: ModelFactory;
  many?: boolean;
  localKey?: string;
  foreignKey?: string;
};

export type ModelArgsPropertyArgs =
  | ModelArgsRegularPropertyArgs
  | ModelArgsComputedPropertyArgs
  | ModelArgsRelationshipPropertyArgs;

export interface ModelArgs {
  properties: {
    [key: string]: ModelArgsPropertyArgs;
  };
}

export type PropertyType<
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
  ? Args["many"] extends true
    ? ReturnType<Args["modelFactory"]>[]
    : ReturnType<Args["modelFactory"]>
  : never;

export type PropertiesFromModelArgs<Args extends ModelArgs> = Partial<
  {
    [K in keyof Args["properties"]]: PropertyType<Args["properties"][K]>;
  }
>;

export type RequiredPropertyFromPropertyArgs<
  Args extends ModelArgsPropertyArgs
> = Args extends ModelArgsRegularPropertyArgs
  ? Args["required"] extends true
    ? PropertyType<Args>
    : never
  : never;

export type ReadOnlyPropertiesFromModelArgs<
  Args extends ModelArgs
> = ObjectWithoutNeverProperties<
  {
    readonly [P in keyof Args["properties"]]: Args["properties"][P] extends ModelArgsComputedPropertyArgs
      ? PropertyType<Args["properties"][P]>
      : never;
  }
>;

export type RequiredPropertiesFromModelArgs<Args extends ModelArgs> = Required<
  ObjectWithoutNeverProperties<
    {
      [P in keyof Args["properties"]]: RequiredPropertyFromPropertyArgs<
        Args["properties"][P]
      >;
    }
  >
>;

export type ModelHasRelationshipFromModelArgs<
  Args extends ModelArgsPropertyArgs
> = Args extends ModelArgsRelationshipPropertyArgs ? PropertyType<Args> : never;

export type ModelHasRelationshipsFromModelArgs<Args extends ModelArgs> = {
  [K in keyof Args["properties"]]: ObjectWithoutNeverProperties<
    ModelHasRelationshipFromModelArgs<Args["properties"][K]>
  >;
};

export type ModelFactoryArgsFromModelArgs<
  Args extends ModelArgs
> = PropertiesFromModelArgs<Args> & RequiredPropertiesFromModelArgs<Args>;

export type ModelInternalProperties<Args extends ModelArgs> = {
  readonly $factory: ModelFactory<Args>;
};

export type Model<Args extends ModelArgs = any> = PropertiesFromModelArgs<
  Args
> &
  RequiredPropertiesFromModelArgs<Args> &
  ModelHasRelationshipsFromModelArgs<Args> &
  ModelInternalProperties<Args> &
  // This must come last because it marks existing things as ReadOnly
  ReadOnlyPropertiesFromModelArgs<Args>;

export type ModelFactory<Args extends ModelArgs = any> = (
  initialValue: ModelFactoryArgsFromModelArgs<Args>
) => Model<Args>;

export function isModel<Args extends ModelArgs = any>(
  obj: unknown
): obj is Model<Args> {
  if (typeof obj !== "object") return false;
  if (Array.isArray(obj)) return false;
  if ("$factory" in obj) return false;
  return true;
}
