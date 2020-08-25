import { createSchema, Schema, SchemaNodeType } from "schema";

import { createTablesFromSchema } from "persist/helpers/createTablesFromSchema";
import { createTestConnection } from "persist/helpers/createTestConnection";
import { createModel } from "./createModel";

it("works for 1:1 relationships", async () => {
  const schema: Schema = createSchema({
    entities: [
      {
        name: "User",
        nodes: {
          id: SchemaNodeType.NUMBER,
          email: SchemaNodeType.STRING,
          profile: {
            type: SchemaNodeType.ONE_TO_ONE,
            of: "Profile",
          },
        },
      },
      {
        name: "Profile",
        nodes: {
          id: SchemaNodeType.NUMBER,
          preferredName: SchemaNodeType.STRING,
          user: {
            type: SchemaNodeType.ONE_TO_ONE,
            of: "User",
          },
        },
      },
    ],
  });

  interface NormalizedProfile {
    id: number;
    preferredName: string;
    userId: number;
  }

  interface NormalizedUser {
    id: number;
    email: string;
    profileId: number;
  }

  interface DenormalizedUser {
    id: number;
    email: string;
    profile: () => Promise<NormalizedProfile>;
  }

  interface DenormalizedProfile {
    id: number;
    preferredName: string;
    user: () => Promise<NormalizedUser>;
  }

  const connection = await createTestConnection();
  const [tables] = await createTablesFromSchema(connection, schema);

  // Set our schema table names properly here to account for our test
  // environment's random table names
  schema.entities[0].tableName = tables["User"];
  schema.entities[1].tableName = tables["Profile"];

  const User = createModel<DenormalizedUser, NormalizedUser>({
    schema,
    connection,
    entity: "User",
    tableName: tables["User"],
  });

  const Profile = createModel<DenormalizedProfile, NormalizedProfile>({
    schema,
    connection,
    entity: "Profile",
    tableName: tables["Profile"],
  });

  const user = await User.create({ email: "email", profileId: 1 });
  const profile = await Profile.create({
    preferredName: "preferredName",
    userId: 1,
  });

  const denormalizedUser = User.denormalize(user);
  const denormalizedProfile = Profile.denormalize(profile);

  await expect(denormalizedUser.profile()).resolves.toEqual({
    id: 1,
    preferredName: "preferredName",
    userId: 1,
  });
  await expect(denormalizedProfile.user()).resolves.toEqual({
    email: "email",
    id: 1,
    profileId: 1,
  });
});
