import { isEmptyObject, Maybe } from "helpers";
import {
  isRelationalNode,
  SchemaNodeWithOneToOne,
  SchemaNodeWithOneToMany,
  SchemaNodeWithManyToOne,
  SchemaNodeWithManyToMany,
  SchemaWithRelationshipNodeType,
} from "schema/relationship/schema";

import {
  Model,
  NormalizedModel,
  CreateModelFactoryFullArguments,
} from "../createModel";
import { getEntityFromSchemaByName } from "../../helpers/getEntityFromSchemaByName";
import { RelationalDiscriminator } from "../../connection";

import { createOneToOneFunction } from "./createOneToOneFunction";
import { createOneToManyFunction } from "./createOneToManyFunction";
import { createManyToOneFunction } from "./createManyToOneFunction";
import { createManyToManyFunction } from "./createManyToManyFunction";

export type DenormalizerFactorySingle<
  ParentNormalizedModel extends NormalizedModel = any,
  NodeNormalizedModel extends NormalizedModel = any
> = (
  parentModel: ParentNormalizedModel
) => () => Promise<Maybe<NodeNormalizedModel>>;

export type DenormalizerFactoryMultiple<
  ParentNormalizedModel extends NormalizedModel = any,
  NodeNormalizedModel extends NormalizedModel = any
> = (
  parentModel: ParentNormalizedModel
) => (discriminator: RelationalDiscriminator) => Promise<NodeNormalizedModel[]>;

export type DenormalizableNodes =
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
>({ schema, connection, entity }: CreateModelFactoryFullArguments) {
  const nodesToDenormalize: DenormalizeNodeMap = {};
  const entityToDenormalize = getEntityFromSchemaByName(schema, entity);

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
    // One to one
    if (
      nodePropertyDeclaration.type === SchemaWithRelationshipNodeType.ONE_TO_ONE
    ) {
      denormalizeFactoryFunctions[nodeName] = createOneToOneFunction({
        connection,
        localEntityName: entity,
        property: nodePropertyDeclaration,
        schema,
      });
      continue;
    }

    // One to many
    if (
      nodePropertyDeclaration.type ===
      SchemaWithRelationshipNodeType.ONE_TO_MANY
    ) {
      denormalizeFactoryFunctions[nodeName] = createOneToManyFunction({
        connection,
        localEntityName: entity,
        property: nodePropertyDeclaration,
        schema,
      });
      continue;
    }

    // Many to one
    if (
      nodePropertyDeclaration.type ===
      SchemaWithRelationshipNodeType.MANY_TO_ONE
    ) {
      denormalizeFactoryFunctions[nodeName] = createManyToOneFunction({
        connection,
        property: nodePropertyDeclaration,
        schema,
      });
      continue;
    }

    // Many to many
    if (
      nodePropertyDeclaration.type ===
      SchemaWithRelationshipNodeType.MANY_TO_MANY
    ) {
      denormalizeFactoryFunctions[nodeName] = createManyToManyFunction({
        connection,
        localEntityName: entity,
        property: nodePropertyDeclaration,
        schema,
      });
      continue;
    }
  }

  return (models: NM[]): M[] =>
    models.map((nm) => {
      const model: any = {
        ...nm,
      };
      for (const k of Object.keys(denormalizeFactoryFunctions)) {
        model[k] = denormalizeFactoryFunctions[k](nm);
      }
      return model as M;
    });
}
