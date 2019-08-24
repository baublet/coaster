import findByFactory from "./findBy";
import createModel from "../../../model/createModel";
import { PersistMatcherType } from "../..";
import { userModel, memoryMap as partialMap } from "./findBy.test";

const groupModel = createModel({
  name: "test"
});

export const memoryMap = {
  ...partialMap,
  group: {
    "2": {
      data: {
        id: 2,
        name: "Group Two"
      }
    }
  }
};

// @ts-ignore
const findBy = findByFactory(memoryMap);

it("finds by non-ID property", async () => {
  const results = await findBy({
    query: {
      $model: userModel,
      $join: {
        $conditions: {
          $hereProperty: "group",
          $thereProperty: "id",
          $comparator: PersistMatcherType.EQUAL
        },
        $model: groupModel
      }
    }
  });
  // expect(results).toEqual([memoryMap.test2]);
});
