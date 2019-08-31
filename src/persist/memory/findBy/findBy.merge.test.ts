import findByFactory from "./findBy";
import createModel from "../../../model/createModel";
import { SchemaNodeType } from "../../../model/schema";

const accountModel = createModel({
  name: "account",
  schema: {
    balance: SchemaNodeType.INT
  }
});

const userModel = createModel({
  name: "user",
  schema: {
    name: SchemaNodeType.STRING,
    account: accountModel
  }
});

const memoryMap = {
  account: {
    1: {
      id: 1,
      balance: 12
    }
  },
  user: {
    1: {
      id: 1,
      account_id: 1,
      name: "Ted"
    }
  }
};

const findBy = findByFactory(memoryMap);

it("it expands a model relation properly", async () => {
  const results = await findBy({
    query: {
      $model: userModel,
      id: 1
    },
    eager: true
  });
  expect(results[0].$relationships).toBeTruthy();
});
