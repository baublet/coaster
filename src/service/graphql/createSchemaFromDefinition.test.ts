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
            testQuery: {
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
            }
          }
        }
      })
    )
  ).toEqual(1);
});
