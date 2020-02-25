import {
  ModelArgsRelationshipPropertyArgs,
  Model,
  isModel,
  ModelArgs
} from "./types";

export function assignRelationships<Args extends ModelArgs>(
  args: ModelArgsRelationshipPropertyArgs,
  node: undefined | Object | Object[] | Model<Args> | Model<Args>[]
): Model<Args> | Model<Args>[] | undefined {
  if (node === undefined) return undefined;
  const factory = args.modelFactory;
  if (Array.isArray(node)) {
    // HACK: https://github.com/microsoft/TypeScript/issues/35045
    return (node as any).map(n => (isModel<Args>(n) ? n : factory(n)));
  }
  return (isModel(node) ? node : factory(node)) as Model<Args>;
}
