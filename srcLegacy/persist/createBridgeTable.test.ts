import { db } from "testHelpers/db";

import { createBridgeTable } from "./createBridgeTable";
import { connect } from "./connect";
import { ModelArgsPropertyType } from "model/types";
import { createPersistedModel } from "./createPersistedModel";

it("creates a new table", async () => {
  const persist = connect(db);

  const Penny = createPersistedModel({
    name: "Penny",
    properties: {
      id: {
        type: ModelArgsPropertyType.STRING
      }
    },
    persist: { with: persist }
  });

  const Nickel = createPersistedModel({
    name: "Nickel",
    properties: {
      id: {
        type: ModelArgsPropertyType.STRING
      }
    },
    persist: { with: persist }
  });

  const [bridgeTableName] = await createBridgeTable(Nickel, Penny);

  await expect(persist.table(bridgeTableName).columnInfo()).resolves.toEqual({
    id: {
      defaultValue: null,
      maxLength: null,
      nullable: true,
      type: "bigint"
    },
    nickel_id: {
      defaultValue: null,
      maxLength: null,
      nullable: false,
      type: "bigint"
    },
    penny_id: {
      defaultValue: null,
      maxLength: null,
      nullable: false,
      type: "bigint"
    }
  });
});
