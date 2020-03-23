export type ObjectWithoutNeverProperties<Obj extends object> = Pick<
  {
    [Key in keyof Obj]: Obj[Key] extends object
      ? ObjectWithoutNeverProperties<Obj[Key]>
      : Obj[Key];
  },
  {
    [Key in keyof Obj]: Obj[Key] extends never | Pick<never, never>
      ? never
      : Key;
  }[keyof Obj]
>;

// Type tests

type _TestObjectWithoutNeverPropertiesRecursive = ObjectWithoutNeverProperties<{
  a: number;
  c: string;
  b: never;
  d: {
    a: { a: "a" };
    b: never;
    c: never;
    d: number;
  };
  e: { a: never };
}>;

export const _testObjectWithoutNeverPropertiesRecursive: _TestObjectWithoutNeverPropertiesRecursive = {
  a: 1,
  c: "c",
  d: {
    a: { a: "a" },
    d: 2
  }
};
