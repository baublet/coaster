import {
  CreateModelFactoryFullArguments,
  NormalizedModelFactory,
  NormalizedModel,
  ModelFactoryOptions,
} from "../createModel";
import { RelationalDiscriminator } from "../../connection";

export function createDeleteWhereFunction<NM extends NormalizedModel>({
  connection,
  tableName,
}: CreateModelFactoryFullArguments): NormalizedModelFactory<NM>["deleteWhere"] {
  async function deleteWhereFunction(
    constrainer: RelationalDiscriminator<NM>,
    options: ModelFactoryOptions = {}
  ): Promise<number> {
    return constrainer(
      (options.connection || connection).table(tableName)
    ).delete();
  }

  return deleteWhereFunction as NormalizedModelFactory<NM>["deleteWhere"];
}
