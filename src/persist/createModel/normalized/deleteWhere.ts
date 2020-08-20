import {
  CreateModelFactoryFullArguments,
  NormalizedModelFactory,
  Model,
  NormalizedModel,
} from "../createModel";
import { ConstrainerFunction } from "../../connection";

export function createDeleteWhereFunction<
  M extends Model,
  NM extends NormalizedModel
>({
  connection,
  tableName,
}: CreateModelFactoryFullArguments): NormalizedModelFactory<
  M,
  NM
>["deleteWhere"] {
  async function deleteWhereFunction(
    constrainer: ConstrainerFunction<NM>
  ): Promise<number> {
    return constrainer(connection.table(tableName)).delete();
  }

  return deleteWhereFunction as NormalizedModelFactory<M, NM>["deleteWhere"];
}
