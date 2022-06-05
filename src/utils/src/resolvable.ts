export type Resolvable<T> = T extends (...args: any[]) => any
  ? never
  : T | Promise<T> | (() => T);
