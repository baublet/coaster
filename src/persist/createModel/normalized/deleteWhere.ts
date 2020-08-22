import {
  CreateModelFactoryFullArguments,
  NormalizedModelFactory,
  NormalizedModel,
} from "../createModel";
import { ConstrainerFunction } from "../../connection";

export function createDeleteWhereFunction<NM extends NormalizedModel>({
  connection,
  tableName,
}: CreateModelFactoryFullArguments): NormalizedModelFactory<NM>["deleteWhere"] {
  async function deleteWhereFunction(
    constrainer: ConstrainerFunction<NM>
  ): Promise<number> {
    return constrainer(connection.table(tableName)).delete();
  }

  return deleteWhereFunction as NormalizedModelFactory<NM>["deleteWhere"];
}
