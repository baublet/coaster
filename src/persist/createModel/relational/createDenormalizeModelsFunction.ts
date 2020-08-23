import {
  Model,
  NormalizedModel,
  CreateModelFactoryFullArguments,
} from "../createModel";
import { getEntityFromSchemaByName } from "persist/helpers/getEntityFromSchemaByName";
import {
  isRelationalNode,
  SchemaNodeWithOneToOne,
  SchemaNodeWithOneToMany,
  SchemaNodeWithManyToOne,
  SchemaNodeWithManyToMany,
  SchemaWithRelationshipNodeType,
} from "schema/relationship/schema";
import { RelationalDiscriminator } from "persist/connection";
import { isEmptyObject } from "helpers/isEmptyObject";

type Maybe<T> = T | void;
type DenormalizerWithNullable<
  NM extends NormalizedModel,
  Nullable extends boolean
> = Nullable extends true ? Maybe<NM> : NM;

type DenormalizerFactorySingle<
  ParentNormalizedModel extends NormalizedModel = any,
  NodeNormalizedModel extends NormalizedModel = any,
  Nullable extends boolean = false
> = (
  parentModel: ParentNormalizedModel
) => () => Promise<DenormalizerWithNullable<NodeNormalizedModel, Nullable>>;

type DenormalizerFactoryMultiple<
  ParentNormalizedModel extends NormalizedModel = any,
  NodeNormalizedModel extends NormalizedModel = any
> = (
  parentModel: ParentNormalizedModel
) => (discriminator: RelationalDiscriminator) => Promise<NodeNormalizedModel[]>;

type DenormalizeModels<M extends Model, NM extends NormalizedModel> = (
  models: NM[]
) => M[];

type DenormalizableNodes =
  | SchemaNodeWithOneToOne
  | SchemaNodeWithOneToMany
  | SchemaNodeWithManyToOne
  | SchemaNodeWithManyToMany;
type DenormalizeNodeMap = Record<string, DenormalizableNodes>;
type DenormalizerFactoryFunctions = Record<
  string,
  DenormalizerFactoryMultiple | DenormalizerFactorySingle
>;

export function createDenormalizeModelsFunction<
  M extends Model,
  NM extends NormalizedModel
>({ schema, connection, entity, tableName }: CreateModelFactoryFullArguments) {
  const nodesToDenormalize: DenormalizeNodeMap = {};
  const entityToDenormalize = getEntityFromSchemaByName(entity, schema);

  for (const [nodeName, nodePropertyDeclaration] of Object.entries(
    entityToDenormalize.nodes
  )) {
    if (!isRelationalNode(nodePropertyDeclaration)) {
      continue;
    }
    nodesToDenormalize[nodeName] = nodePropertyDeclaration;
  }

  if (isEmptyObject(nodesToDenormalize)) {
    // Nothing to do! All we need here is send the normalized models back as the
    // denormalized models.
    return (models: NM[]): M[] => (models as unknown) as M[];
  }

  const denormalizeFactoryFunctions: DenormalizerFactoryFunctions = {};

  for (const [nodeName, nodePropertyDeclaration] of Object.entries(
    nodesToDenormalize
  )) {
    if (
      nodePropertyDeclaration.type === SchemaWithRelationshipNodeType.ONE_TO_ONE
    ) {
    }
  }

  return (models: NM[]): M[] => {};
}
