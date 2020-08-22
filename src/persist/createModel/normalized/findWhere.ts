import { NormalizedModelFactory, NormalizedModel } from "../createModel";
import { CreateModelFactoryFullArguments } from "../createModel";
import { ConstrainerFunction } from "../../connection";

export function createFindWhereFunction<NM extends NormalizedModel>({
  connection,
  tableName,
}: CreateModelFactoryFullArguments): NormalizedModelFactory<NM>["findWhere"] {
  async function findWhereFunction(
    constrainer: ConstrainerFunction<NM>
  ): Promise<NM[]> {
    return constrainer(connection.table(tableName).select("*"));
  }

  return findWhereFunction as NormalizedModelFactory<NM>["findWhere"];
}
