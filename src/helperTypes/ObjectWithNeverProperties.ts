export type ObjectWithoutNeverProperties<
  O extends Record<string | number | symbol, any>
> = Pick<
  O,
  {
    [K in keyof O]: O[K] extends never ? never : K;
  }[keyof O]
>;
// Type tests

type _TestObjectWithoutNeverProperties = ObjectWithoutNeverProperties<{
  a: number;
  c: string;
  b: never;
}>;

export const _testObjectWithoutNeverProperties: _TestObjectWithoutNeverProperties = {
  a: 1,
  c: "a"
};
