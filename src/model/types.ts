import { ModelFieldValidator } from "./validate";
import { GeneratedNames } from "helpers/generateNames";

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
  RELATIONSHIP = "relationship"
}

export const CoasterPropertyType = {
  ...ModelArgsPropertyType
};

export interface ModelArgsDefaultPropertyArgs {
  /**
   * Validation rules for this property
   */
  validate?: ModelFieldValidator[];
}

export interface ModelArgsPrimitivePropertyArgs
  extends ModelArgsDefaultPropertyArgs {
  type:
    | ModelArgsPropertyType.STRING
    | ModelArgsPropertyType.NUMBER
    | ModelArgsPropertyType.BOOLEAN;
  required?: boolean;
}

export interface ModelArgsRelationshipPropertyArgs
  extends ModelArgsDefaultPropertyArgs {
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
  required?: boolean;
}

export type ModelArgsPropertyArgs =
  | ModelArgsRelationshipPropertyArgs
  | ModelArgsPrimitivePropertyArgs;

export type ModelHooks = {
  /**
   * Fires before we instantiate a model
   */
  beforeInstantiate?: ((
    initialData: Record<string, any>
  ) => Record<string, any>)[];
  /**
   * Fires after we instantiate a model
   */
  afterInstantiate?: ((model: Model) => void)[];
};

export interface ModelArgs {
  /**
   * The canonical name of the model; be careful with changing this value.
   * Coaster infers a lot from the name, including DB column names (when
   * they're not explicitly defined). Changing this could break your
   * application.
   */
  name: string;
  /**
   * The model's accessors for data
   */
  properties: Record<string, ModelArgsPropertyArgs>;
  /**
   * Model basic hooks
   */
  hooks?: ModelHooks;
}

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
  readonly $initialValues: ModelFactoryArgsFromModelArgs<Args>;
}

export type Model<Args extends ModelArgs = any> = PropertiesFromModelArgs<
  Args
> &
  RequiredPropertiesFromModelArgs<Args> &
  ModelInternalProperties<Args>;

export interface ModelFactory<Args extends ModelArgs = any> {
  (initialValue: ModelFactoryArgsFromModelArgs<Args>): Model<Args>;
  readonly $id: Symbol;
  /**
   * Returns the primitive data for the model
   */
  readonly $data: (model: Model<Args>) => Record<string, any>;
  readonly $name: string;
  readonly $names: GeneratedNames;
  readonly $options: ModelArgs;
  /**
   * Clones a model
   * @param model
   */
  readonly clone: (model: Model<Args>) => Model<Args>;
  /**
   * Renders the model to JSON.
   * @param model
   * @param maxDepth - Max levels to render to JSON. Default is 5.
   */
  readonly toJson: (
    model: Model<Args>,
    maxDepth?: number,
    currentDepth?: number
  ) => Record<string, any>;
}

export function isModel<Args extends ModelArgs = any>(
  obj: unknown
): obj is Model<Args> {
  if (typeof obj !== "object") return false;
  if (Array.isArray(obj)) return false;
  if ("$factory" in obj) return true;
  return false;
}
