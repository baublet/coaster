import findByFactory from "./findBy";
import createModel from "../../../model/createModel";

const groupModel = createModel({
  name: "group"
});

const userModel = createModel({
  name: "user"
})

export const memoryMap = {
  user: {
    test1: {
      id: "test1",
      name: "Killer Dave",
      group_id: "2"
    }
  },
  group: {
    "2": {
      id: "2",
      name: "Group Two"
    }
  }
};

// @ts-ignore
const findBy = findByFactory(memoryMap);

it("merges properly based on inferred properties", async () => {
  const results = await findBy({
    query: {
      $model: userModel,
      $merge: groupModel
    }
  });
  // expect(results[0].data).toEqual({
  //   ...memoryMap.user.test1,
  //   group: memoryMap.group["2"]
  // });
});
