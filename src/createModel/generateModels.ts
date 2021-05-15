import knex from "knex";
import DataLoader from "dataloader";

type ModelFactoryFactory<TModel = {}, TRawModel = {}, TConnection = any> = (
  getConnection: () => Promise<TConnection>
) => ModelFactory<TModel, TRawModel, TConnection>;

interface ModelFactory<
  TModel = {},
  TRawModel = {},
  TConnection = any,
  TQuery = any
> {
  getConnection: () => Promise<TConnection>;
  getDataLoader: <
    TKey extends keyof TRawModel,
    TMany extends boolean | undefined
  >(
    key: keyof TRawModel,
    many?: TMany
  ) => Promise<
    DataLoader<TRawModel[TKey], TMany extends true ? TRawModel[] : TRawModel>
  >;
  getQuery: () => Promise<TQuery>;
  create: (args: Partial<TRawModel>) => Promise<TRawModel>;
  createMany: (args: Partial<TRawModel>[]) => Promise<TRawModel[]>;
  update: (args: Partial<TRawModel>) => Promise<TRawModel>;
  updateMany: (args: Partial<TRawModel>) => Promise<TRawModel>;
  upsert: (args: Partial<TRawModel>) => Promise<TRawModel>;
  upsertMany: (args: Partial<TRawModel[]>) => Promise<TRawModel[]>;
}

interface Schema {
  name: string;
  models: SchemaModel[];
  modelFactory: ModelFactoryFactory;
}

interface SchemaModel {
  id: string;
  names: {
    singularCamel: string;
    singularPascal: string;
    pluralCamel: string;
    pluralPascal: string;
  };
  properties: Record<string, ModelPropertyDefinition>;
}

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

type ModelPropertyRelationalDefinition =
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

type ModelPropertyOneToOneDefinitionOptions =
  | ModelPropertyOneToOneDefinitionOptionsA
  | ModelPropertyOneToOneDefinitionOptionsB;

interface ModelPropertyOneToOneDefinitionOptionsA {
  /* The column on the foreign model that references the local model */
  foreignKey: string;
  /* When the foreign field references the local model, this is the field the local references it by. Defaults to "id" */
  key?: string;
}

interface ModelPropertyOneToOneDefinitionOptionsB {
  /* The column on the local model that references the foreign model */
  key: string;
  keyType?: string;
  /* When a local field references a foreign model, this is the field the foreign model is referenced by. Defaults to "id" */
  foreignKey?: string;
}

interface ModelPropertyOneToOneDefinition
  extends CommonModelPropertyDefinition {
  type: "one-to-one";
  modelId: string;
  default?: ModelDefinition;
  oneToOneOptions: ModelPropertyOneToOneDefinitionOptions;
}

interface ModelPropertyManyToOneDefinition
  extends CommonModelPropertyDefinition {
  type: "many-to-one";
  modelId: string;
  manyToOneOptions: {
    /* The field on local models that reference a foreign model */
    key: string;
    keyType?: string;
    /* When we need to reference a foreign model, we access the foreign field via this field name. Defaults to "id" */
    foreignKey?: string;
  };
}

interface ModelPropertyOneToManyDefinition
  extends CommonModelPropertyDefinition {
  type: "one-to-many";
  modelId: string;
  oneToManyOptions: {
    /* The field on the foreign models that reference a local model */
    foreignKey: string;
    /* When a foreign model in this relationship references the local model, it does so via this field name. Defaults to "id" */
    key?: string;
  };
}

interface ModelPropertyManyToManyDefinition
  extends CommonModelPropertyDefinition {
  type: "many-to-many";
  modelId: string;
  manyToManyOptions: {
    /* When looking up foreign models, foreignKey is the column we perform lookups by */
    foreignKey?: string;
    /* When looking up local models, we look them up via this column */
    localKey?: string;
    /* Many-to-many relationships require a join table */
    joinTable: {
      /* Canonical name of the join table */
      name: string;
      /* When referencing local models, this is the column we look things up by. Default: "local_model_id" */
      localModelKey?: string;
      /* When references foreign models, this is the column we look things up by. Default: "foreign_model_id" */
      foreignModelKey?: string;
    };
  };
}

type ModelId = string;

function isRelationshipType(
  type: string
): type is "one-to-one" | "many-to-one" | "one-to-many" | "many-to-many" {
  if (type === "one-to-one") return true;
  if (type === "many-to-one") return true;
  if (type === "one-to-many") return true;
  if (type === "many-to-many") return true;
  return false;
}

function assertIsModelSchemaType(
  modelSchemaDefinition: ModelPropertyDefinition
): asserts modelSchemaDefinition is ModelPropertyRelationalDefinition {
  if (!isRelationshipType(modelSchemaDefinition.type)) {
    throw new Error(
      `Unexpected invariance violation: assertIsModelSchemaType expected a relational model type. Got instead ${modelSchemaDefinition.type}`
    );
  }
}

export async function generateModels(schema: Schema): Promise<string> {
  let output: string = `const schema = ${JSON.stringify(schema)};\n\n`;

  const models: Map<ModelId, SchemaModel> = new Map();
  const relationshipTokens: Map<ModelId, [string, string][]> = new Map();

  for (const model of schema.models) {
    models.set(model.id, model);
    for (const modelProperty of Object.keys(model.properties)) {
      if (isRelationshipType(model.properties[modelProperty].type)) {
        const modelDefinition = model.properties[modelProperty];
        assertIsModelSchemaType(modelDefinition);
        if (!relationshipTokens.has(model.id)) {
          relationshipTokens.set(model.id, []);
        }
        relationshipTokens
          .get(model.id)
          .push([modelProperty, modelDefinition.modelId]);
      }
    }
  }

  const relationships: Map<SchemaModel, Map<string, SchemaModel>> = new Map();
  for (const modelId of relationshipTokens.keys()) {
    if (!models.has(modelId)) {
      continue;
    }
    const localModel = models.get(modelId)[0];
    if (!relationships.has(localModel)) {
      relationships.set(localModel, new Map());
    }
    for (const [modelProperty, foreignId] of relationshipTokens.get(modelId)) {
      if (!models.has(foreignId)) {
        throw new ModelRelationshipNotFoundError({
          models,
          onModel: modelId,
          modelProperty,
          notFoundId: foreignId,
        });
      }
      relationships
        .get(localModel)
        .set(modelProperty, models.get(foreignId)[0]);
    }
  }

  for (const [, modelOptions] of models.entries()) {
    // Without hidden/relational properties
    output += `interface ${modelOptions.names.singularPascal} {`;
    for (const accessor of Object.keys(modelOptions.properties)) {
      const property = modelOptions.properties[accessor];
      if (isRelationshipType(property.type)) {
        continue;
      }
      output += `  ${accessor}: ${property.type};`;
    }
    output += "}\n\n";

    // Raw DB object
    output += `interface Raw${modelOptions.names.singularPascal} {`;
    for (const accessor of Object.keys(modelOptions.properties)) {
      const property = modelOptions.properties[accessor];
      if (isRelationshipType(property.type)) {
        if (property.type === "many-to-one") {
          if (property.manyToOneOptions.key) {
            output += `  ${property.manyToOneOptions.key}: ${
              property.manyToOneOptions.keyType || "string"
            };`;
          }
        }
        if (property.type === "one-to-one") {
          if (property.oneToOneOptions.key) {
            output += `  ${property.oneToOneOptions.key}: ${
              (property.oneToOneOptions as Record<string, any>).keyType ||
              "string"
            };`;
          }
        }
        continue;
      }
      output += `  ${accessor}: ${property.type};`;
    }
    output += "}\n\n";
  }

  return output;
}

class ModelRelationshipNotFoundError extends Error {
  constructor({
    models,
    onModel,
    notFoundId,
    modelProperty,
  }: {
    models: Map<ModelId, SchemaModel>;
    onModel: string;
    notFoundId: string;
    modelProperty: string;
  }) {
    const sourceModel = models.get(onModel);
    const modelName = sourceModel.names.singularPascal;
    super(
      `Error parsing the ${modelName} model! Relationship ${modelName}.${modelProperty} references a model whose ID we have no record of (${notFoundId}). Check the spelling of the ID and make sure that the relationship model exists in the schema. All models: ${Array.from(
        models.keys()
      ).join(", ")}`
    );
  }
}
