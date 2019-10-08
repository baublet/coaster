import findByFactory from "./findBy";
import createModel from "../../../model/createModel";
import { PersistMatcherType } from "persist";
import inMemoryPersistence from "persist/memory";

const memoryMap = {
  default: {
    accounts: {
      abc: {
        id: "abc",
        balance: 12
      }
    },
    users: {
      1: {
        id: 1,
        account_id: "abc",
        name: "Ted"
      }
    }
  }
};

const memoryStore = inMemoryPersistence(memoryMap);

const accountModel = createModel({
  name: "account",
  persistWith: memoryStore
});

const userModel = createModel({
  name: "user",
  persistWith: memoryStore,
  has: [accountModel]
});

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
