import { string } from "yargs";
import { generateModels } from "./generateModels";
import { generateNames } from "./generateNames";

it("generates the right types", async () => {
  await expect(
    generateModels({
      name: "Test Schema 1",
      models: [
        {
          id: "user",
          names: generateNames("User"),
          properties: {
            id: {
              type: "string",
            },
            bio: {
              type: "string",
            },
            created: {
              type: "date",
            },
          },
        },
        {
          id: "org",
          names: generateNames("Organization"),
          properties: {
            id: {
              type: "string",
            },
            description: {
              type: "string",
            },
            users: {
              type: "many-to-many",
              modelId: "user",
              manyToManyOptions: {
                joinTable: {
                  name: "user_orgs",
                },
              },
            },
          },
        },
        {
          id: "settings",
          names: generateNames("Settings"),
          properties: {
            id: {
              type: "string",
            },
            user: {
              type: "one-to-one",
              modelId: "user",
              oneToOneOptions: {
                key: "user_id",
              },
            },
          },
        },
      ],
    })
  ).resolves.toMatchSnapshot();
});
