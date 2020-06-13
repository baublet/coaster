import {
  GraphQLInputObjectType,
  GraphQLInt,
  GraphQLList,
  GraphQLEnumType,
  GraphQLString,
  GraphQLNonNull
} from "graphql";
import { PersistedModelFactory } from "persist";
import { ServiceContext } from "service/types";
import {
  PersistModelRelationship,
  PersistedModel,
  PersistQueryBuilder
} from "persist/types";
import { createDataLoaderForModelFactory } from "./createDataLoaderForModelFactory";

export interface ModelListResolverParent {
  queryWithBaseConstraints: PersistQueryBuilder;
  input: ModelConnectionInputArguments;
}

export interface ModelConnectionInputArguments {
  filter?: string;
  limit?: number;
  offset?: number;
  sort?: {
    field: string;
    direction: "ASC" | "DESC";
  }[];
}

const SortDirection = new GraphQLEnumType({
  name: "SortDirection",
  values: {
    ASC: {
      description: "Ascending"
    },
    DESC: {
      description: "Descending"
    }
  }
});

const SortOptions = new GraphQLInputObjectType({
  name: "SortOptions",
  fields: {
    field: {
      type: new GraphQLNonNull(GraphQLString),
      description: "Field to sort on"
    },
    direction: {
      type: SortDirection,
      description: "Direction to sort by",
      defaultValue: "ASC"
    }
  }
});

/**
 * Returns a resolver for default model connections when they're associated
 * with models they have relationships to.
 */
export function defaultRelationshipFactory() {
  // parentFactory: PersistedModelFactory,
  // childFactory: PersistedModelFactory
  // const parentPrimaryKey = parentFactory.$options.primaryKey;
  // const childPrimaryKey = childFactory.$options.primaryKey;

  return (): // parent: PersistedModelFactory,
  // input: ModelConnectionInputArguments,
  // context: ServiceContext
  Promise<PersistQueryBuilder> => {
    // TODO: filter along input.filter
    return 1 as any;
  };
}

export function connectionInput(factory: PersistedModelFactory) {
  return new GraphQLInputObjectType({
    name: `${factory.name}ModelConnectionInput`,
    description: `Filtering, sorting, and pagination for ${factory.name}`,
    fields: {
      filters: {
        type: GraphQLString,
        description:
          "Filter connection results by these options. Uses the parser format from the following module: https://www.npmjs.com/package/search-query-parser"
      },
      limit: {
        type: GraphQLInt,
        description: "The maximum number of results to return"
      },
      offset: {
        type: GraphQLInt,
        description: "Skip this number of results before returning results"
      },
      sort: {
        type: new GraphQLList(new GraphQLNonNull(SortOptions))
      }
    }
  });
}

export interface ModelConnectionRootNodeReturn<
  Parent extends PersistedModelFactory,
  Child extends PersistedModelFactory
> {
  parent: ReturnType<Parent>;
  parentFactory: Parent;
  connectionFactory: Child;
  input: ModelConnectionInputArguments;
  relationship: PersistModelRelationship;
}

/**
 * Creates a resolver for `totalCount` on a connection type. The parent should
 * always be an object with one property: queryWithBaseConstraints. That prop
 * is an instance `PersistQueryBuilder` with the initial constraints (like the
 * whereIn, any filters applied, but _never_ with limit and offsets applied).
 */
export function totalCountResolver() {
  return async ({
    queryWithBaseConstraints
  }: ModelListResolverParent): Promise<number> => {
    return await queryWithBaseConstraints.count();
  };
}

export interface ModelConnectionNodeNotLoadedValue<
  Child extends PersistedModelFactory = any
> {
  id: string;
  connectionFactory: Child;
}

/**
 * Creates a resolver for `nodes` on a connection type. The parent should
 * always be an object with a property queryWithBaseConstraints. That prop
 * is an instance `PersistQueryBuilder` with the initial constraints (like the
 * whereIn, any filters applied, but _never_ with limit and offsets applied).
 *
 * The resolver also takes the initial input from the top-level connection
 * resolver so that we can correctly limit, offset, and order the result-set.
 *
 * It resolves into an array of IDs that field-level resolvers handle resolving
 * via a dataLoader.
 */
export function modelListResolverFactory<T extends PersistedModelFactory>(
  connectionModelFactory: T
) {
  const childPrimaryKey = connectionModelFactory.$options.primaryKey;
  return async ({
    queryWithBaseConstraints,
    input
  }: ModelListResolverParent): Promise<string[]> => {
    if (input.limit) queryWithBaseConstraints.limit(input.limit);
    if (input.offset) queryWithBaseConstraints.offset(input.offset);
    if (input.sort) {
      for (const { field, direction = "ASC" } of input.sort) {
        queryWithBaseConstraints.orderBy(field, direction);
      }
    }

    const results = await queryWithBaseConstraints;

    return results.map(result => ({
      id: result[childPrimaryKey],
      connectionFactory: connectionModelFactory
    }));
  };
}

/**
 * A default resolver for loading models in any connection. If you're a parent
 * returning models, return or resolve from the parent a string that represents
 * the model's primary key to load via DataLoader.
 */
export function nodeResolverFactory<T extends PersistedModelFactory>(
  modelFactory: T
) {
  return async (
    id: string,
    _args: unknown,
    context: ServiceContext
  ): Promise<PersistedModel> => {
    // Some basic runtime error checking
    if (typeof id !== "string") {
      throw new Error(
        `We tried to resolve a model without an ID. Coaster ships with default resolvers that utilize dataLoaders for models you utilize in your GraphQL schema. These resolvers take as a parent a simple ID. Make sure your parent resolver returns a string of the model you want to load!`
      );
    }

    // Create the dataloader if it doesn't exist
    if (!context.modelDataLoaders) {
      context.modelDataLoaders = {};
    }
    if (!context.modelDataLoaders[modelFactory.name]) {
      context.modelDataLoaders[
        modelFactory.name
      ] = createDataLoaderForModelFactory(modelFactory);
    }

    const dataLoader = context.modelDataLoaders[modelFactory.name];
    return dataLoader.load(id);
  };
}
