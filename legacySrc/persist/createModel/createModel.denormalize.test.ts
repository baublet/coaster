import { createSchema, Schema, SchemaNodeType } from "schema";

import { createTablesFromSchema } from "persist/helpers/createTablesFromSchema";
import { createTestConnection } from "persist/helpers/createTestConnection";
import { createModel, NormalizedModelFactory } from "./createModel";

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
        posts: {
          type: SchemaNodeType.ONE_TO_MANY,
          of: "Post",
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
    {
      name: "Post",
      nodes: {
        id: SchemaNodeType.NUMBER,
        user: {
          type: SchemaNodeType.MANY_TO_ONE,
          of: "User",
        },
        title: SchemaNodeType.STRING,
        content: SchemaNodeType.STRING,
        date: SchemaNodeType.NUMBER,
      },
    },
    {
      name: "Article",
      nodes: {
        id: SchemaNodeType.NUMBER,
        title: SchemaNodeType.STRING,
        content: SchemaNodeType.STRING,
        date: SchemaNodeType.NUMBER,
        authors: {
          type: SchemaNodeType.MANY_TO_MANY,
          of: "User",
          through: "ArticleAuthor",
          localThroughColumn: "articleId",
        },
      },
    },
    {
      name: "ArticleAuthor",
      nodes: {
        id: SchemaNodeType.NUMBER,
        articleId: SchemaNodeType.NUMBER,
        userId: SchemaNodeType.NUMBER,
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

interface NormalizedPost {
  id: number;
  userId: number;
  date: number;
  title: string;
  content: string;
}

interface NormalizedArticle {
  id: number;
  date: number;
  title: string;
  content: string;
}

interface DenormalizedUser {
  id: number;
  email: string;
  profile: () => Promise<NormalizedProfile>;
  posts: () => Promise<NormalizedPost>;
}

interface DenormalizedProfile {
  id: number;
  preferredName: string;
  user: () => Promise<NormalizedUser>;
}

interface DenormalizedPost {
  id: number;
  user: () => Promise<NormalizedUser>;
  date: number;
  title: string;
  content: string;
}

interface DenormalizedArticle {
  id: number;
  date: number;
  title: string;
  content: string;
  authors: () => Promise<NormalizedUser>;
}

interface GeneratedPostModel {
  normalizedModel: NormalizedPost;
  denormalizedModel: DenormalizedPost;
}

interface GeneratedUserModel {
  normalizedModel: NormalizedUser;
  denormalizedModel: DenormalizedUser;
  methods: {
    articles: {
      associate(
        article: NormalizedArticle | DenormalizedArticle,
        user: NormalizedUser | DenormalizedUser
      ): Promise<void>;
      disassociate(
        article: NormalizedArticle | DenormalizedArticle,
        user: NormalizedUser | DenormalizedUser
      ): Promise<void>;
      clear(article: NormalizedArticle | DenormalizedArticle): Promise<void>;
    };
  };
}

interface GeneratedProfileModel {
  normalizedModel: NormalizedProfile;
  denormalizedModel: DenormalizedProfile;
}

interface GeneratedArticleModel {
  normalizedModel: NormalizedArticle;
  denormalizedModel: DenormalizedArticle;
  methods: {
    users: {
      associate(
        article: NormalizedArticle | DenormalizedArticle,
        user: NormalizedUser | DenormalizedUser
      ): Promise<void>;
      disassociate(
        article: NormalizedArticle | DenormalizedArticle,
        user: NormalizedUser | DenormalizedUser
      ): Promise<void>;
      clear(article: NormalizedArticle | DenormalizedArticle): Promise<void>;
    };
  };
}

let connection;
let tables;
let Article: NormalizedModelFactory<
  DenormalizedArticle,
  NormalizedArticle,
  GeneratedArticleModel["methods"]
>;
let User: NormalizedModelFactory<
  DenormalizedUser,
  NormalizedUser,
  GeneratedUserModel["methods"]
>;
let Profile: NormalizedModelFactory<DenormalizedProfile, NormalizedProfile, {}>;
let Post: NormalizedModelFactory<DenormalizedPost, NormalizedPost, {}>;
let user;
let profile;
let post1;
let denormalizedUser;
let denormalizedProfile;
let denormalizedArticle;
let denormalizedPost1;

beforeAll(async () => {
  connection = await createTestConnection();
  const [tableMap] = await createTablesFromSchema(connection, schema);
  tables = tableMap;

  // Set our schema table names properly here to account for our test
  // environment's random table names
  schema.entities[0].tableName = tables["User"];
  schema.entities[1].tableName = tables["Profile"];
  schema.entities[2].tableName = tables["Post"];
  schema.entities[3].tableName = tables["Article"];
  schema.entities[4].tableName = tables["ArticleAuthor"];

  User = createModel<GeneratedUserModel>({
    schema,
    connection,
    entity: "User",
    tableName: tables["User"],
  });

  Profile = createModel<GeneratedProfileModel>({
    schema,
    connection,
    entity: "Profile",
    tableName: tables["Profile"],
  });

  Post = createModel<GeneratedPostModel>({
    schema,
    connection,
    entity: "Post",
    tableName: tables["Post"],
  });

  Article = createModel<GeneratedArticleModel>({
    schema,
    connection,
    entity: "Article",
    tableName: tables["Article"],
  });

  user = await User.create({ email: "email", profileId: 1 });
  profile = await Profile.create({
    preferredName: "preferredName",
    userId: 1,
  });
  post1 = await Post.create({
    userId: user.id,
    date: 1,
    title: "Post 1 title",
    content: "Post 1 content",
  });
  await Post.create({
    userId: user.id,
    date: 2,
    title: "Post 2 title",
    content: "Post 2 content",
  });

  denormalizedUser = User.denormalize(user);
  denormalizedProfile = Profile.denormalize(profile);
  denormalizedPost1 = Post.denormalize(post1);
});

it("works for one-to-one relationships", async () => {
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

it("works for one-to-many and many-to-one relationships", async () => {
  await expect(denormalizedUser.posts()).resolves.toEqual([
    {
      content: "Post 1 content",
      date: 1,
      id: 1,
      title: "Post 1 title",
      userId: 1,
    },
    {
      content: "Post 2 content",
      date: 2,
      id: 2,
      title: "Post 2 title",
      userId: 1,
    },
  ]);
  await expect(denormalizedPost1.user()).resolves.toEqual({
    email: "email",
    id: 1,
    profileId: 1,
  });

  // Applying discriminators
  await expect(
    denormalizedUser.posts((qb) => qb.where("date", "=", 2))
  ).resolves.toEqual([
    {
      content: "Post 2 content",
      date: 2,
      id: 2,
      title: "Post 2 title",
      userId: 1,
    },
  ]);
});

it("works on many-to-many relationships", async () => {});
