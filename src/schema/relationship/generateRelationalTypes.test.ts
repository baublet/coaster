import { generateRelationalTypes } from "./generateRelationalTypes";
import { generateNames } from "helpers/generateNames";
import { SchemaWithRelationshipNodeType } from "./schema";
import { SchemaNodeType } from "schema/primitive/schema";

it("throws if we can't find the relationship: no inference", () => {
  expect(() =>
    generateRelationalTypes({
      schema: {
        name: "Name",
        description: "Description",
        entities: [
          {
            names: generateNames("user"),
            description: "The user record",
            nodes: {
              id: SchemaNodeType.NUMBER,
              username: SchemaNodeType.STRING,
              profile: {
                type: SchemaWithRelationshipNodeType.ONE_TO_ONE,
                of: "UserProfile"
              },
            },
          },
        ],
      },
    })
  ).toThrow(
    "Entity User references an unknown entity. Searched for: UserProfile. No partial matches. Known entities: User"
  );
});

it("throws if we can't find the relationship: did you mean", () => {
  expect(() =>
    generateRelationalTypes({
      schema: {
        name: "Name",
        description: "Description",
        entities: [
          {
            names: generateNames("user"),
            description: "The user record",
            nodes: {
              id: SchemaNodeType.NUMBER,
              username: SchemaNodeType.STRING,
              profile: {
                type: SchemaWithRelationshipNodeType.ONE_TO_ONE,
                of: "User profile",
              },
            },
          },
          {
            names: generateNames("userProfile"),
            description:
              "Information the user wants to display on their profile",
            nodes: {
              user: {
                type: SchemaWithRelationshipNodeType.ONE_TO_ONE,
                of: "User",
              },
              name: SchemaNodeType.STRING,
            },
          },
        ],
      },
    })
  ).toThrow(
    "Entity User references an unknown entity. Searched for: User profile. Did you mean UserProfile?"
  );
});

it("transforms relationships to multiple objects: one to one", () => {
  expect(
    generateRelationalTypes({
      schema: {
        name: "Name",
        description: "Description",
        entities: [
          {
            names: generateNames("user"),
            description: "The user record",
            nodes: {
              id: SchemaNodeType.NUMBER,
              username: SchemaNodeType.STRING,
              profile: {
                type: SchemaWithRelationshipNodeType.ONE_TO_ONE,
                of: "UserProfile",
              },
            },
          },
          {
            names: generateNames("userProfile"),
            description:
              "Information the user wants to display on their profile",
            nodes: {
              user: {
                type: SchemaWithRelationshipNodeType.ONE_TO_ONE,
                of: "User",
              },
              name: SchemaNodeType.STRING,
            },
          },
        ],
      },
    })
  ).toMatchInlineSnapshot(`
    Array [
      Object {
        "description": "Description",
        "entities": Array [
          Object {
            "description": "The user record",
            "names": Object {
              "camel": "normalizedUser",
              "canonical": "normalizedUser",
              "original": "normalizedUser",
              "originalPlural": "normalizedUsers",
              "pascal": "NormalizedUser",
              "plural": "normalizedUsers",
              "pluralSafe": "normalized_users",
              "safe": "normalized_user",
            },
            "nodes": Object {
              "id": "number",
              "userProfileId": Object {
                "nullable": false,
                "type": "number",
              },
              "username": "string",
            },
          },
          Object {
            "description": "The user record",
            "names": Object {
              "camel": "user",
              "canonical": "user",
              "original": "user",
              "originalPlural": "users",
              "pascal": "User",
              "plural": "users",
              "pluralSafe": "users",
              "safe": "user",
            },
            "nodes": Object {
              "id": "number",
              "profile": Object {
                "definition": "() => Promise<NormalizedUserProfile>",
                "nullable": false,
                "type": "raw",
              },
              "username": "string",
            },
          },
          Object {
            "description": "Information the user wants to display on their profile",
            "names": Object {
              "camel": "normalizedUserProfile",
              "canonical": "normalizedUserProfile",
              "original": "normalizedUserProfile",
              "originalPlural": "normalizedUserProfiles",
              "pascal": "NormalizedUserProfile",
              "plural": "normalizedUserProfiles",
              "pluralSafe": "normalized_user_profiles",
              "safe": "normalized_user_profile",
            },
            "nodes": Object {
              "name": "string",
              "userId": Object {
                "nullable": false,
                "type": "number",
              },
            },
          },
          Object {
            "description": "Information the user wants to display on their profile",
            "names": Object {
              "camel": "userProfile",
              "canonical": "userProfile",
              "original": "userProfile",
              "originalPlural": "userProfiles",
              "pascal": "UserProfile",
              "plural": "userProfiles",
              "pluralSafe": "user_profiles",
              "safe": "user_profile",
            },
            "nodes": Object {
              "name": "string",
              "user": Object {
                "definition": "() => Promise<NormalizedUser>",
                "nullable": false,
                "type": "raw",
              },
            },
          },
        ],
        "name": "Name",
      },
      Array [
        "import { RelationalDiscriminator } from \\"coaster\\";",
      ],
    ]
  `);
});

it("transforms relationships to multiple objects: one to many / many to one", () => {
  expect(
    generateRelationalTypes({
      schema: {
        name: "Name",
        description: "Description",
        entities: [
          {
            names: generateNames("user"),
            nodes: {
              posts: {
                type: SchemaWithRelationshipNodeType.ONE_TO_MANY,
                of: "Post",
              },
            },
          },
          {
            names: generateNames("post"),
            nodes: {
              title: SchemaNodeType.STRING,
              content: SchemaNodeType.STRING,
              user: {
                type: SchemaWithRelationshipNodeType.MANY_TO_ONE,
                of: "User",
              },
            },
          },
        ],
      },
    })
  ).toMatchInlineSnapshot(`
    Array [
      Object {
        "description": "Description",
        "entities": Array [
          Object {
            "description": undefined,
            "names": Object {
              "camel": "normalizedUser",
              "canonical": "normalizedUser",
              "original": "normalizedUser",
              "originalPlural": "normalizedUsers",
              "pascal": "NormalizedUser",
              "plural": "normalizedUsers",
              "pluralSafe": "normalized_users",
              "safe": "normalized_user",
            },
            "nodes": Object {
              "postId": Object {
                "nullable": false,
                "type": "number",
              },
            },
          },
          Object {
            "description": undefined,
            "names": Object {
              "camel": "user",
              "canonical": "user",
              "original": "user",
              "originalPlural": "users",
              "pascal": "User",
              "plural": "users",
              "pluralSafe": "users",
              "safe": "user",
            },
            "nodes": Object {
              "posts": Object {
                "definition": "(discriminator?: RelationalDiscriminator) => Promise<NormalizedPost[]>",
                "nullable": false,
                "type": "raw",
              },
            },
          },
          Object {
            "description": undefined,
            "names": Object {
              "camel": "normalizedPost",
              "canonical": "normalizedPost",
              "original": "normalizedPost",
              "originalPlural": "normalizedPosts",
              "pascal": "NormalizedPost",
              "plural": "normalizedPosts",
              "pluralSafe": "normalized_posts",
              "safe": "normalized_post",
            },
            "nodes": Object {
              "content": "string",
              "title": "string",
              "userId": Object {
                "nullable": false,
                "type": "number",
              },
            },
          },
          Object {
            "description": undefined,
            "names": Object {
              "camel": "post",
              "canonical": "post",
              "original": "post",
              "originalPlural": "posts",
              "pascal": "Post",
              "plural": "posts",
              "pluralSafe": "posts",
              "safe": "post",
            },
            "nodes": Object {
              "content": "string",
              "title": "string",
              "user": Object {
                "definition": "() => Promise<NormalizedUser>",
                "nullable": false,
                "type": "raw",
              },
            },
          },
        ],
        "name": "Name",
      },
      Array [
        "import { RelationalDiscriminator } from \\"coaster\\";",
      ],
    ]
  `);
});
