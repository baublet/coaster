import { createModel } from "model";
import { db } from "testHelpers/db";

import { createBridgeTable } from "./createBridgeTable";
import { connect } from "./connect";
import { ModelArgsPropertyType } from "model/types";

it("creates a new table", async () => {
  const persist = connect(db);

  const Penny = createModel({
    name: "Penny",
    properties: {
      id: {
        type: ModelArgsPropertyType.STRING
      }
    },
    persist: { with: persist }
  });

  const Nickel = createModel({
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
