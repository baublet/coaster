import findByFactory from "./findBy";
import createModel from "../../../model/createModel";

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
