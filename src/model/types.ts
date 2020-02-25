import { ModelFieldValidator } from "./validate";
import { PersistConnection } from "persist/types";

export type ObjectWithoutNeverProperties<
  O extends Record<string | number | symbol, any>
> = Pick<
  O,
  {
    [K in keyof O]: O[K] extends never ? never : K;
  }[keyof O]
>;

export enum ModelArgsPropertyType {
  BOOLEAN = "boolean",
  STRING = "string",
  NUMBER = "number",
  COMPUTED = "computed",
  RELATIONSHIP = "relationship"
}

export interface ModelArgsDefaultPropertyArgs {
  /**
   * Validation rules for this property
   */
  validate?: ModelFieldValidator[];
}

export interface ModelArgsPrimitivePropertyArgs {
  type:
    | ModelArgsPropertyType.STRING
    | ModelArgsPropertyType.NUMBER
    | ModelArgsPropertyType.BOOLEAN;
  required?: boolean;
}

export interface ModelArgsComputedPropertyArgs {
  type: ModelArgsPropertyType.COMPUTED;
  compute: (obj: any) => any;
}

export interface ModelArgsRelationshipPropertyArgs {
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
  required?: boolean;
}

export type ModelArgsPropertyArgs = ModelArgsDefaultPropertyArgs &
  (
    | ModelArgsComputedPropertyArgs
    | ModelArgsRelationshipPropertyArgs
    | ModelArgsPrimitivePropertyArgs
  );

export interface ModelBaseArgs {
  /**
   * The canonical name of the model; be careful with changing this value.
   * Coaster infers a lot from the name, including DB column names (when
   * they're not explicitly defined). Changing this could break your
   * application.
   */
  name: string;
  /**
   * The model's accessors for data retrieval and access
   */
  properties: Record<string, ModelArgsPropertyArgs>;
}

export interface PersistModelArgs extends ModelBaseArgs {
  persist: {
    /**
     * Persistence database connection to use
     */
    with: PersistConnection;
    /**
     * Table name name of the model. The default is a database-safe version of
     * the model name
     */
    tableName?: string;
    /**
     * Primary index key of the model. Default is "id"
     */
    primaryKey?: string;
  };
}

export type ModelArgs = ModelBaseArgs | PersistModelArgs;

type ModelTypeFromRelationshipPropertyArgs<
  Args extends ModelArgsRelationshipPropertyArgs
> = Args["many"] extends true
  ? ReturnType<Args["modelFactory"]>[]
  : ReturnType<Args["modelFactory"]>;

export type PropertyType<Args extends ModelArgsPropertyArgs> =
  /**
   * Primitives
   */
  Args["type"] extends ModelArgsPropertyType.STRING
    ? string
    : Args["type"] extends ModelArgsPropertyType.BOOLEAN
    ? boolean
    : Args["type"] extends ModelArgsPropertyType.NUMBER
    ? number
    : /**
     * Computed props
     */
    Args extends ModelArgsComputedPropertyArgs
    ? () => ReturnType<Args["compute"]>
      /**
       * Relationships. We need to extract ModelTypeFromRelationshipPropertyArgs
       * or TypeScript yells that we're doing circular references...
       */
    : Args extends ModelArgsRelationshipPropertyArgs
    ? ModelTypeFromRelationshipPropertyArgs<Args>
    : /**
       * Unknown!
       */
      never;

export type PropertiesFromModelArgs<Args extends ModelArgs> = Partial<
  {
    [K in keyof Args["properties"]]: PropertyType<Args["properties"][K]>;
  }
>;

export type RequiredPropertyFromPropertyArgs<
  Args extends ModelArgsPropertyArgs
> = Args extends ModelArgsPrimitivePropertyArgs
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

export type ModelFactoryArgsFromModelArgs<
  Args extends ModelArgs
> = PropertiesFromModelArgs<Args> & RequiredPropertiesFromModelArgs<Args>;

export interface ModelInternalProperties<Args extends ModelArgs> {
  /**
   * A pointer to the model factory that this model was generated from
   */
  readonly $factory: ModelFactory<Args>;
  /**
   * The base values that the model was initialized with
   */
  readonly $baseValues: ModelFactoryArgsFromModelArgs<Args>;
}

export type Model<Args extends ModelArgs = any> = PropertiesFromModelArgs<
  Args
> &
  RequiredPropertiesFromModelArgs<Args> &
  ModelInternalProperties<Args> &
  // This must come last because it marks existing things as ReadOnly
  ReadOnlyPropertiesFromModelArgs<Args>;

export interface ModelFactory<Args extends ModelArgs = any> {
  (initialValue: ModelFactoryArgsFromModelArgs<Args>): Model<Args>;
  readonly $id: Symbol;
  readonly $name: string;
  readonly $options: Args;
}

export function isModel<Args extends ModelArgs = any>(
  obj: unknown
): obj is Model<Args> {
  if (typeof obj !== "object") return false;
  if (Array.isArray(obj)) return false;
  if ("$factory" in obj) return true;
  return true;
}

export function isPersistedModel(model: Model): model is Model {
  return Boolean(model?.$factory?.$options?.persist?.with);
}
