import {
  NormalizedModelFactory,
  NormalizedModel,
  ModelFactoryOptions,
} from "../createModel";
import { CreateModelFactoryFullArguments } from "../createModel";
import { RelationalDiscriminator } from "../../connection";

export function createFindWhereFunction<NM extends NormalizedModel>({
  connection,
  tableName,
}: CreateModelFactoryFullArguments): NormalizedModelFactory<NM>["findWhere"] {
  async function findWhereFunction(
    constrainer: RelationalDiscriminator<NM>,
    options: ModelFactoryOptions = {}
  ): Promise<NM[]> {
    return constrainer(
      (options.connection || connection).table(tableName).select("*")
    );
  }

  return findWhereFunction as NormalizedModelFactory<NM>["findWhere"];
}
