export type Resolvable<T, TFnArgs = any> =
  | T
  | Promise<T>
  | ((arg: TFnArgs) => T)
  | ((arg: TFnArgs) => Promise<T>);
