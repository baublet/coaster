import { ModelFieldValidator } from "./validate";

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

export type ModelArgsDefaultPropertyArgs = {
  validate?: ModelFieldValidator[];
};

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
  /**
   * The model factory to relate this prop to.
   */
  modelFactory: ModelFactory;
  /**
   * Whether this relationship has multiple nodes; leave undefined for implicit
   * single nodes, or use a boolean value for explicit value
   */
  many?: boolean;
  /**
   * The key in the bridge table that references the current model
   */
  localKey?: string;
  /**
   * The key in the bridge table that relates to the model declared in modelFactory
   */
  foreignKey?: string;
  /**
   * Whether or not the relationship/s is/are required in order to validate.
   */
  required?: boolean;
};

export type ModelArgsPropertyArgs = ModelArgsDefaultPropertyArgs &
  (
    | ModelArgsRegularPropertyArgs
    | ModelArgsComputedPropertyArgs
    | ModelArgsRelationshipPropertyArgs
  );

export interface ModelArgs {
  /**
   * The canonical name of the model. Be careful with changing this value. We
   * infer a lot from the name, including DB column names (when they're not
   * explicitly defined). Changing this could break your application.
   */
  name: string;
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

export type ModelHasRelationshipsFromModelArgs<
  Args extends ModelArgs
> = ObjectWithoutNeverProperties<
  {
    [K in keyof Args["properties"]]: ModelHasRelationshipFromModelArgs<
      Args["properties"][K]
    >;
  }
>;

export type ModelFactoryArgsFromModelArgs<
  Args extends ModelArgs
> = PropertiesFromModelArgs<Args> & RequiredPropertiesFromModelArgs<Args>;

export type ModelInternalProperties<Args extends ModelArgs> = {
  /**
   * A pointer to the model factory that this model was generated from
   */
  readonly $factory: ModelFactory<Args>;
  /**
   * The base values that the model was initialized with
   */
  readonly $baseValues: ModelFactoryArgsFromModelArgs<Args>;
};

export type Model<Args extends ModelArgs = any> = PropertiesFromModelArgs<
  Args
> &
  RequiredPropertiesFromModelArgs<Args> &
  ModelHasRelationshipsFromModelArgs<Args> &
  ModelInternalProperties<Args> &
  // This must come last because it marks existing things as ReadOnly
  ReadOnlyPropertiesFromModelArgs<Args>;

export interface ModelFactory<Args extends ModelArgs = any> {
  (initialValue: ModelFactoryArgsFromModelArgs<Args>): Model<Args>;
  $id: Symbol;
  $name: string;
  $options: Args;
}

export function isModel<Args extends ModelArgs = any>(
  obj: unknown
): obj is Model<Args> {
  if (typeof obj !== "object") return false;
  if (Array.isArray(obj)) return false;
  if ("$factory" in obj) return true;
  return true;
}
