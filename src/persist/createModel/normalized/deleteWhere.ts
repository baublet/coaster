import {
  CreateModelFactoryFullArguments,
  NormalizedModelFactory,
  NormalizedModel,
} from "../createModel";
import { RelationalDiscriminator } from "../../connection";

export function createDeleteWhereFunction<NM extends NormalizedModel>({
  connection,
  tableName,
}: CreateModelFactoryFullArguments): NormalizedModelFactory<NM>["deleteWhere"] {
  async function deleteWhereFunction(
    constrainer: RelationalDiscriminator<NM>
  ): Promise<number> {
    return constrainer(connection.table(tableName)).delete();
  }

  return deleteWhereFunction as NormalizedModelFactory<NM>["deleteWhere"];
}
