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
                of: "UserProfile",
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
              "camelPlural": "normalizedUsers",
              "canonical": "NormalizedUser",
              "original": "normalizedUser",
              "originalPlural": "normalizedUsers",
              "pascal": "NormalizedUser",
              "pascalPlural": "NormalizedUsers",
              "safe": "normalized_user",
              "safePlural": "normalized_users",
              "snake": "normalized_user",
              "snakePlural": "normalized_users",
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
              "camelPlural": "users",
              "canonical": "User",
              "original": "user",
              "originalPlural": "users",
              "pascal": "User",
              "pascalPlural": "Users",
              "safe": "user",
              "safePlural": "users",
              "snake": "user",
              "snakePlural": "users",
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
            "names": Object {
              "camel": "userModel",
              "camelPlural": "userModels",
              "canonical": "UserModel",
              "original": "UserModel",
              "originalPlural": "UserModels",
              "pascal": "UserModel",
              "pascalPlural": "UserModels",
              "safe": "user_model",
              "safePlural": "user_models",
              "snake": "user_model",
              "snakePlural": "user_models",
            },
            "nodes": Object {
              "denormalized": Object {
                "definition": "User",
                "type": "raw",
              },
              "methods": Object {
                "definition": "UserModelMethods",
                "type": "raw",
              },
              "normalized": Object {
                "definition": "NormalizedUser",
                "type": "raw",
              },
            },
          },
          Object {
            "description": "Information the user wants to display on their profile",
            "names": Object {
              "camel": "normalizedUserProfile",
              "camelPlural": "normalizedUserProfiles",
              "canonical": "NormalizedUserProfile",
              "original": "normalizedUserProfile",
              "originalPlural": "normalizedUserProfiles",
              "pascal": "NormalizedUserProfile",
              "pascalPlural": "NormalizedUserProfiles",
              "safe": "normalized_user_profile",
              "safePlural": "normalized_user_profiles",
              "snake": "normalized_user_profile",
              "snakePlural": "normalized_user_profiles",
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
              "camelPlural": "userProfiles",
              "canonical": "UserProfile",
              "original": "userProfile",
              "originalPlural": "userProfiles",
              "pascal": "UserProfile",
              "pascalPlural": "UserProfiles",
              "safe": "user_profile",
              "safePlural": "user_profiles",
              "snake": "user_profile",
              "snakePlural": "user_profiles",
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
          Object {
            "names": Object {
              "camel": "userProfileModel",
              "camelPlural": "userProfileModels",
              "canonical": "UserProfileModel",
              "original": "UserProfileModel",
              "originalPlural": "UserProfileModels",
              "pascal": "UserProfileModel",
              "pascalPlural": "UserProfileModels",
              "safe": "user_profile_model",
              "safePlural": "user_profile_models",
              "snake": "user_profile_model",
              "snakePlural": "user_profile_models",
            },
            "nodes": Object {
              "denormalized": Object {
                "definition": "UserProfile",
                "type": "raw",
              },
              "methods": Object {
                "definition": "UserProfileModelMethods",
                "type": "raw",
              },
              "normalized": Object {
                "definition": "NormalizedUserProfile",
                "type": "raw",
              },
            },
          },
        ],
        "name": "Name",
      },
      Array [
        "import { RelationalDiscriminator } from \\"coaster\\";",
        "interface UserModelMethods = ",
        "interface UserProfileModelMethods = ",
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
              "camelPlural": "normalizedUsers",
              "canonical": "NormalizedUser",
              "original": "normalizedUser",
              "originalPlural": "normalizedUsers",
              "pascal": "NormalizedUser",
              "pascalPlural": "NormalizedUsers",
              "safe": "normalized_user",
              "safePlural": "normalized_users",
              "snake": "normalized_user",
              "snakePlural": "normalized_users",
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
              "camelPlural": "users",
              "canonical": "User",
              "original": "user",
              "originalPlural": "users",
              "pascal": "User",
              "pascalPlural": "Users",
              "safe": "user",
              "safePlural": "users",
              "snake": "user",
              "snakePlural": "users",
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
            "names": Object {
              "camel": "userModel",
              "camelPlural": "userModels",
              "canonical": "UserModel",
              "original": "UserModel",
              "originalPlural": "UserModels",
              "pascal": "UserModel",
              "pascalPlural": "UserModels",
              "safe": "user_model",
              "safePlural": "user_models",
              "snake": "user_model",
              "snakePlural": "user_models",
            },
            "nodes": Object {
              "denormalized": Object {
                "definition": "User",
                "type": "raw",
              },
              "methods": Object {
                "definition": "UserModelMethods",
                "type": "raw",
              },
              "normalized": Object {
                "definition": "NormalizedUser",
                "type": "raw",
              },
            },
          },
          Object {
            "description": undefined,
            "names": Object {
              "camel": "normalizedPost",
              "camelPlural": "normalizedPosts",
              "canonical": "NormalizedPost",
              "original": "normalizedPost",
              "originalPlural": "normalizedPosts",
              "pascal": "NormalizedPost",
              "pascalPlural": "NormalizedPosts",
              "safe": "normalized_post",
              "safePlural": "normalized_posts",
              "snake": "normalized_post",
              "snakePlural": "normalized_posts",
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
              "camelPlural": "posts",
              "canonical": "Post",
              "original": "post",
              "originalPlural": "posts",
              "pascal": "Post",
              "pascalPlural": "Posts",
              "safe": "post",
              "safePlural": "posts",
              "snake": "post",
              "snakePlural": "posts",
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
          Object {
            "names": Object {
              "camel": "postModel",
              "camelPlural": "postModels",
              "canonical": "PostModel",
              "original": "PostModel",
              "originalPlural": "PostModels",
              "pascal": "PostModel",
              "pascalPlural": "PostModels",
              "safe": "post_model",
              "safePlural": "post_models",
              "snake": "post_model",
              "snakePlural": "post_models",
            },
            "nodes": Object {
              "denormalized": Object {
                "definition": "Post",
                "type": "raw",
              },
              "methods": Object {
                "definition": "PostModelMethods",
                "type": "raw",
              },
              "normalized": Object {
                "definition": "NormalizedPost",
                "type": "raw",
              },
            },
          },
        ],
        "name": "Name",
      },
      Array [
        "import { RelationalDiscriminator } from \\"coaster\\";",
        "interface UserModelMethods = ",
        "interface PostModelMethods = ",
      ],
    ]
  `);
});

it("transforms relationships to multiple objects: many to many", () => {
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
                type: SchemaWithRelationshipNodeType.MANY_TO_MANY,
                of: "Post",
                through: "PostAuthor",
              },
            },
          },
          {
            names: generateNames("postAuthor"),
            nodes: {
              id: SchemaNodeType.NUMBER,
              userId: SchemaNodeType.NUMBER,
              postId: SchemaNodeType.NUMBER,
            },
          },
          {
            names: generateNames("post"),
            nodes: {
              title: SchemaNodeType.STRING,
              content: SchemaNodeType.STRING,
              user: {
                type: SchemaWithRelationshipNodeType.MANY_TO_MANY,
                of: "User",
                through: "PostAuthor",
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
            "names": Object {
              "camel": "postAuthor",
              "camelPlural": "postAuthors",
              "canonical": "PostAuthor",
              "original": "postAuthor",
              "originalPlural": "postAuthors",
              "pascal": "PostAuthor",
              "pascalPlural": "PostAuthors",
              "safe": "post_author",
              "safePlural": "post_authors",
              "snake": "post_author",
              "snakePlural": "post_authors",
            },
            "nodes": Object {
              "id": "number",
              "postId": "number",
              "userId": "number",
            },
          },
          Object {
            "description": undefined,
            "names": Object {
              "camel": "normalizedUser",
              "camelPlural": "normalizedUsers",
              "canonical": "NormalizedUser",
              "original": "normalizedUser",
              "originalPlural": "normalizedUsers",
              "pascal": "NormalizedUser",
              "pascalPlural": "NormalizedUsers",
              "safe": "normalized_user",
              "safePlural": "normalized_users",
              "snake": "normalized_user",
              "snakePlural": "normalized_users",
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
              "camelPlural": "users",
              "canonical": "User",
              "original": "user",
              "originalPlural": "users",
              "pascal": "User",
              "pascalPlural": "Users",
              "safe": "user",
              "safePlural": "users",
              "snake": "user",
              "snakePlural": "users",
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
            "names": Object {
              "camel": "userModel",
              "camelPlural": "userModels",
              "canonical": "UserModel",
              "original": "UserModel",
              "originalPlural": "UserModels",
              "pascal": "UserModel",
              "pascalPlural": "UserModels",
              "safe": "user_model",
              "safePlural": "user_models",
              "snake": "user_model",
              "snakePlural": "user_models",
            },
            "nodes": Object {
              "denormalized": Object {
                "definition": "User",
                "type": "raw",
              },
              "methods": Object {
                "definition": "UserModelMethods",
                "type": "raw",
              },
              "normalized": Object {
                "definition": "NormalizedUser",
                "type": "raw",
              },
            },
          },
          Object {
            "description": undefined,
            "names": Object {
              "camel": "normalizedPost",
              "camelPlural": "normalizedPosts",
              "canonical": "NormalizedPost",
              "original": "normalizedPost",
              "originalPlural": "normalizedPosts",
              "pascal": "NormalizedPost",
              "pascalPlural": "NormalizedPosts",
              "safe": "normalized_post",
              "safePlural": "normalized_posts",
              "snake": "normalized_post",
              "snakePlural": "normalized_posts",
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
              "camelPlural": "posts",
              "canonical": "Post",
              "original": "post",
              "originalPlural": "posts",
              "pascal": "Post",
              "pascalPlural": "Posts",
              "safe": "post",
              "safePlural": "posts",
              "snake": "post",
              "snakePlural": "posts",
            },
            "nodes": Object {
              "content": "string",
              "title": "string",
              "user": Object {
                "definition": "(discriminator?: RelationalDiscriminator) => Promise<NormalizedUser[]>",
                "nullable": false,
                "type": "raw",
              },
            },
          },
          Object {
            "names": Object {
              "camel": "postModel",
              "camelPlural": "postModels",
              "canonical": "PostModel",
              "original": "PostModel",
              "originalPlural": "PostModels",
              "pascal": "PostModel",
              "pascalPlural": "PostModels",
              "safe": "post_model",
              "safePlural": "post_models",
              "snake": "post_model",
              "snakePlural": "post_models",
            },
            "nodes": Object {
              "denormalized": Object {
                "definition": "Post",
                "type": "raw",
              },
              "methods": Object {
                "definition": "PostModelMethods",
                "type": "raw",
              },
              "normalized": Object {
                "definition": "NormalizedPost",
                "type": "raw",
              },
            },
          },
        ],
        "name": "Name",
      },
      Array [
        "import { RelationalDiscriminator } from \\"coaster\\";",
        "interface UserModelMethods = {
      add(Post | NormalizedPost): Promise<void>;
      clear(): Promise<void>;
      remove(Post | NormalizedPost): Promise<void>;
      set((Post | NormalizedPost)[]): Promise<void>;
    };",
        "interface PostModelMethods = {
      add(User | NormalizedUser): Promise<void>;
      clear(): Promise<void>;
      remove(User | NormalizedUser): Promise<void>;
      set((User | NormalizedUser)[]): Promise<void>;
    };",
      ],
    ]
  `);
});
