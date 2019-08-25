import denormalizeData from "./denormalizeData";
import { SchemaNodeType } from "../../../model/schema";
import generateNames from "../../../helpers/generateNames";
import createModel from "../../../model/createModel";

const userModel = createModel({
  name: "user"
})

it("logs", () => {
  denormalizeData(
    {},
    {
      // @ts-ignore
      user_id: {
        type: SchemaNodeType.ID,
        model: userModel,
        names: generateNames("user_id")
      },
      // @ts-ignore
      name: {
        type: SchemaNodeType.STRING
      }
    },
    {}
  );
});
