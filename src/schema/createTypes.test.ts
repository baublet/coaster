import { SchemaNodeType } from "./createSchema";
import { createTypes } from "./createTypes";
import { generateNames } from "helpers/generateNames";

it("generates a full schema", () => {
  expect(
    createTypes({
      schema: {
        name: "Test Schema!",
        description: "Description of the schema",
        entities: [
          {
            names: generateNames("user"),
            nodes: {
              id: SchemaNodeType.NUMBER,
              username: SchemaNodeType.STRING,
              profile: {
                type: SchemaNodeType.ONE_TO_ONE,
                of: "Profile",
              },
              posts: {
                type: SchemaNodeType.ONE_TO_MANY,
                of: "Post",
              },
            },
          },
          {
            names: generateNames("post"),
            nodes: {
              id: SchemaNodeType.NUMBER,
              title: SchemaNodeType.STRING,
              content: SchemaNodeType.STRING,
              user: {
                type: SchemaNodeType.MANY_TO_ONE,
                of: "User",
              },
            },
          },
          {
            names: generateNames("profile"),
            nodes: {
              id: SchemaNodeType.NUMBER,
              preferredName: {
                type: SchemaNodeType.STRING,
                nullable: true,
              },
              location: {
                type: SchemaNodeType.STRING,
                nullable: true,
              },
            },
          },
        ],
      },
    })
  ).toMatchInlineSnapshot(`
    "import { RelationalDiscriminator } from \\"coaster\\";

    interface Profile {
      id: number;
      preferredName?: string;
      location?: string;
    }

    interface NormalizedUser {
      id: number;
      username: string;
      profileId: number;
      postId: number;
    }

    interface User {
      id: number;
      username: string;
      profile: () => Promise<NormalizedProfile>;
      posts: (discriminator?: RelationalDiscriminator) => Promise<NormalizedPost[]>;
    }

    interface UserModel {
      denormalized: User;
      normalized: NormalizedUser;
      methods: UserModelMethods;
    }

    interface NormalizedPost {
      id: number;
      title: string;
      content: string;
      userId: number;
    }

    interface Post {
      id: number;
      title: string;
      content: string;
      user: () => Promise<NormalizedUser>;
    }

    interface PostModel {
      denormalized: Post;
      normalized: NormalizedPost;
      methods: PostModelMethods;
    }"
  `);
});
