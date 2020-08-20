import {
  NormalizedModelFactory,
  Model,
  NormalizedModel,
  CreateModelFactoryFullArguments,
} from "../createModel";
import { ConstrainerFunction } from "../../connection";

export function createUpdateWhereFunction<
  M extends Model,
  NM extends NormalizedModel
>({
  connection,
  tableName,
}: CreateModelFactoryFullArguments): NormalizedModelFactory<
  M,
  NM
>["updateWhere"] {
  async function updateWhere(
    data: Partial<NM>,
    constrainer: ConstrainerFunction<NM>
  ): Promise<number> {
    const results = await constrainer(connection.table(tableName).update(data));
    if (Array.isArray(results)) {
      return results[0];
    }
    return results as number;
  }

  return updateWhere as NormalizedModelFactory<M, NM>["updateWhere"];
}
