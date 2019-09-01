import findBy from "./findResultsForLogicalMatcher";
import createModel from "../../model/createModel";
import { PersistSortDirection } from "persist";

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

it("finds by non-ID property", async () => {
  const results = await findBy(memoryMap, {
    $model: userModel,
    name: "Gambino Slim"
  });
  expect(results[0]).toEqual(memoryMap.user.test2);
});

it("works across multiple properties", async () => {
  const results = await findBy(memoryMap, {
    $model: userModel,
    group: 3,
    tester: 5
  });
  expect(results[0]).toEqual(memoryMap.user.test3);
});

it("works with $or", async () => {
  const results = await findBy(memoryMap, {
    $model: userModel,
    group: 3,
    tester: 5,
    $or: true
  });
  expect(results).toEqual([
    memoryMap.user.test2,
    memoryMap.user.test3,
    memoryMap.user.test4
  ]);
});

it("fetches multiple queries for with", async () => {
  const results = await findBy(memoryMap, {
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
  });
  expect(results).toEqual([
    memoryMap.user.test5,
    memoryMap.user.test4,
    memoryMap.user.test2
  ]);
});

it("fetches a single query for $with", async () => {
  const results = await findBy(memoryMap, {
    $model: userModel,
    group: 2,
    tester: 67,
    $with: {
      tester: 66
    }
  });
  expect(results).toEqual([memoryMap.user.test5, memoryMap.user.test4]);
});

it("processes a single $without", async () => {
  const results = await findBy(memoryMap, {
    $model: userModel,
    group: 2,
    $without: {
      tester: 67
    }
  });
  expect(results).toEqual([memoryMap.user.test1, memoryMap.user.test2]);
});

it("processes multiple $withouts", async () => {
  const results = await findBy(memoryMap, {
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
  });
  expect(results[0]).toEqual(memoryMap.user.test1);
});

it("respects limit", async () => {
  const results = await findBy(memoryMap, {
    $model: userModel,
    $limit: 1
  });
  expect(results.length).toEqual(1);
});

it("respects offset", async () => {
  const results = await findBy(memoryMap, {
    $model: userModel,
    $offset: 3
  });
  expect(results.length).toEqual(2);
});

it("respects limit _and_ offset", async () => {
  const results = await findBy(memoryMap, {
    $model: userModel,
    $offset: 2,
    $limit: 1
  });
  expect(results.length).toEqual(1);
  expect(results[0]).toEqual(memoryMap.user.test3);
});

it("respects sort order", async () => {
  const results = await findBy(memoryMap, {
    $model: userModel,
    $sort: { property: "name" }
  });
  expect(results[0].name).toEqual("Boots Russel");
  expect(results[results.length - 1].name).toEqual("Tights Spinster");
});

it("respects multiple sort orders", async () => {
  const results = await findBy(memoryMap, {
    $model: userModel,
    $sort: [
      { property: "group" },
      { property: "tester", direction: PersistSortDirection.DESC }
    ]
  });
  expect(results[0].name).toBe("Smoochie");
});
