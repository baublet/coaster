import {
  NormalizedModelFactory,
  NormalizedModel,
  CreateModelFactoryFullArguments,
} from "../createModel";
import { RelationalDiscriminator } from "../../connection";

export function createUpdateWhereFunction<NM extends NormalizedModel>({
  connection,
  tableName,
}: CreateModelFactoryFullArguments): NormalizedModelFactory<NM>["updateWhere"] {
  async function updateWhere(
    data: Partial<NM>,
    constrainer: RelationalDiscriminator<NM>
  ): Promise<number> {
    const results = await constrainer(connection.table(tableName).update(data));
    if (Array.isArray(results)) {
      return results[0];
    }
    return results as number;
  }

  return updateWhere as NormalizedModelFactory<NM>["updateWhere"];
}
