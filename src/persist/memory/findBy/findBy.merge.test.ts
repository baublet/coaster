import findByFactory from "./findBy";
import createModel from "../../../model/createModel";
import { SchemaNodeType } from "../../../model/schema";
import { PersistMatcherType } from "persist";

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
    abc: {
      id: "abc",
      balance: 12
    }
  },
  user: {
    1: {
      id: 1,
      account_id: "abc",
      name: "Ted"
    }
  }
};

const findBy = findByFactory(memoryMap);

it("works to find either of the models alone (smoke test)", async () => {
  let results;
  results = await findBy({
    query: {
      $model: userModel,
      id: [PersistMatcherType.ONE_OF, [1]]
    }
  });
  expect(results.length).toBe(1);
  results = await findBy({
    query: {
      $model: accountModel,
      id: [PersistMatcherType.ONE_OF, ["abc"]]
    }
  });
  expect(results.length).toBe(1);
});

it("it expands a model relation properly", async () => {
  const results = await findBy({
    query: {
      $model: userModel,
      id: 1
    },
    eager: true
  });
  expect(results[0].account.balance).toBe(12);
});
