import findByFactory from "./findBy";
import createModel from "../../../model/createModel";
import { PersistMatcherType } from "persist";

const accountModel = createModel({
  name: "account"
});

const memoryMap = {
  account: {
    "1": {
      id: "1",
      balance: 12
    }
  }
};

const findBy = findByFactory(memoryMap);

it("expands models properly", async () => {
  const results = await findBy({
    query: {
      $model: accountModel,
      id: "1"
    }
  });
  expect(results[0].balance).toBe(12);
});

it("matches one of", async () => {
  let results = await findBy({
    query: {
      $model: accountModel,
      id: [PersistMatcherType.ONE_OF, ["2", "3"]]
    }
  });
  expect(results.length).toBe(0);

  results = await findBy({
    query: {
      $model: accountModel,
      id: [PersistMatcherType.ONE_OF, ["1", "2"]]
    }
  });
  expect(results.length).toBe(1);
});
