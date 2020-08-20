import { NormalizedModelFactory, Model, NormalizedModel } from "../createModel";
import { CreateModelFactoryFullArguments } from "../createModel";
import { ConstrainerFunction } from "../../connection";

export function createFindWhereFunction<
  M extends Model,
  NM extends NormalizedModel
>({
  connection,
  tableName,
}: CreateModelFactoryFullArguments): NormalizedModelFactory<
  M,
  NM
>["findWhere"] {
  async function findWhereFunction(
    constrainer: ConstrainerFunction<NM>
  ): Promise<NM[]> {
    return constrainer(connection.table(tableName).select("*"));
  }

  return findWhereFunction as NormalizedModelFactory<M, NM>["findWhere"];
}
