import { printSchema } from "graphql";

import { ServiceType } from "service/types";
import { createSchemaFromDefinition } from "./createSchemaFromDefinition";
import { GraphQLType } from "./types";
import { createResolver } from "./createResolver";
import { createType } from "./createType";
import { notNull } from "./notNull";
import { createUsersAndTodos } from "testHelpers/Todo";

const TestObject = createType({
  type: GraphQLType.OBJECT,
  name: "TestCollection",
  nullable: false,
  description: "This is a test description",
  nodes: {
    totalCount: {
      type: GraphQLType.INT,
      nullable: false
    },
    nodes: {
      type: GraphQLType.INT
    }
  }
});

it("creates a schema", async () => {
  const { User } = await createUsersAndTodos();
  expect(
    printSchema(
      createSchemaFromDefinition({
        name: "name",
        port: 82,
        type: ServiceType.GRAPHQL,
        options: {
          queries: {
            queryWithObjectReturn: createResolver({
              description: "description",
              resolutionType: notNull(TestObject),
              resolver: async () => {
                return null;
              }
            }),
            queryWithPrimitiveReturn: {
              resolutionType: {
                type: GraphQLType.BOOLEAN
              },
              resolver: async () => {}
            },
            queryWithListReturn: {
              resolutionType: {
                type: GraphQLType.ARRAY_OF,
                value: {
                  type: GraphQLType.OBJECT,
                  name: "TestObjectWithinAList",
                  nodes: {
                    testListOfObjects: {
                      type: GraphQLType.ID,
                      nullable: false
                    },
                    testModel: {
                      type: GraphQLType.MODEL,
                      modelFactory: User,
                      description: "Some user here"
                    },
                    enum: {
                      type: GraphQLType.ENUM,
                      name: "SomeTestEnum",
                      values: {
                        ENUM: "description",
                        ANOTHER: "another description"
                      }
                    }
                  }
                }
              },
              resolver: async () => {}
            },
            queryWithCollectionReturn: createResolver({
              description: "Resolver description",
              resolutionType: {
                type: GraphQLType.CONNECTION,
                description: "Connection description",
                name: "TestingConnections",
                of: {
                  type: GraphQLType.STRING
                }
              },
              resolver: async () => {
                return null;
              }
            })
          }
        }
      })
    )
  ).toMatchSnapshot();
});
