import { createSchemaFromDefinition } from "./createSchemaFromDefinition";
import { ServiceType } from "service/types";
import { GraphQLType } from "./types";
import { printSchema } from "graphql";

it("creates a schema", () => {
  expect(
    printSchema(
      createSchemaFromDefinition({
        name: "name",
        port: 82,
        type: ServiceType.GRAPHQL,
        options: {
          queries: {
            queryWithObjectReturn: {
              description: "description",
              resolutionType: {
                type: GraphQLType.OBJECT,
                nullable: false,
                name: "TestCollection",
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
              },
              resolver: async () => {}
            },
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
            }
          }
        }
      })
    )
  ).toEqual(1);
});
