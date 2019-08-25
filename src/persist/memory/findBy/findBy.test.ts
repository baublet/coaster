import findByFactory from "./findBy";
import createModel from "../../../model/createModel";

export const userModel = createModel({
  name: "user"
});

export const memoryMap = {
  user: {
    test1: {
      id: "test",
      job: "player",
      name: "Boots Russel",
      group: 2,
      tester: 4
    },
    test2: {
      id: "test2",
      job: "player",
      name: "Gambino Slim",
      group: 2,
      tester: 5
    },
    test3: {
      id: "test3",
      job: "preacher",
      name: "Tights Spinster",
      group: 3,
      tester: 5
    },
    test4: {
      id: "test4",
      job: "preacher",
      name: "Dr. Spaceman",
      group: 3,
      tester: 66
    },
    test5: {
      id: "test5",
      job: "cinnamon bun",
      name: "Smoochie",
      group: 2,
      tester: 67
    }
  }
};

// @ts-ignore
const findBy = findByFactory(memoryMap);

it("finds by non-ID property", async () => {
  const results = await findBy({
    query: { $model: userModel, name: "Gambino Slim" }
  });
  expect(results[0].data).toEqual(memoryMap.user.test2);
});

it("works across multiple properties", async () => {
  const results = await findBy({
    query: { $model: userModel, group: 3, tester: 5 }
  });
  expect(results[0].data).toEqual(memoryMap.user.test3);
});

it("works with $or", async () => {
  const results = await findBy({
    query: { $model: userModel, group: 3, tester: 5, $or: true },
    raw: true
  });
  expect(results).toEqual([
    memoryMap.user.test2,
    memoryMap.user.test3,
    memoryMap.user.test4
  ]);
});

it("works across multiple properties (Smoochie)", async () => {
  const results = await findBy({
    query: { $model: userModel, group: 2, tester: 67 }
  });
  expect(results[0].data).toEqual(memoryMap.user.test5);
});

it("fetches multiple queries for with", async () => {
  const results = await findBy({
    query: {
      $model: userModel,
      group: 2,
      tester: 67,
      $with: [
        {
          tester: 66
        },
        {
          name: "Gambino Slim"
        }
      ]
    },
    raw: true
  });
  expect(results).toEqual([
    memoryMap.user.test5,
    memoryMap.user.test4,
    memoryMap.user.test2
  ]);
});

it("fetches a single query for $with", async () => {
  const results = await findBy({
    query: {
      $model: userModel,
      group: 2,
      tester: 67,
      $with: {
        tester: 66
      }
    },
    raw: true
  });
  expect(results).toEqual([memoryMap.user.test5, memoryMap.user.test4]);
});

it("processes a single $without", async () => {
  const results = await findBy({
    query: {
      $model: userModel,
      group: 2,
      $without: {
        tester: 67
      }
    },
    raw: true
  });
  expect(results).toEqual([memoryMap.user.test1, memoryMap.user.test2]);
});

it("processes multiple $withouts", async () => {
  const results = await findBy({
    query: {
      $model: userModel,
      group: 2,
      $without: [
        {
          tester: 67
        },
        {
          name: "Gambino Slim"
        }
      ]
    }
  });
  expect(results[0].data).toEqual(memoryMap.user.test1);
});
