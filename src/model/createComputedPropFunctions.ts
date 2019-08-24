import { Model } from "./createModel";

export type ComputedPropFn<T> = (data: T) => any;
export type ComputedPropClosedFn<T> = () => any;
export type ComputedProps<T> = Record<string, ComputedPropFn<T>>;
export type ComputedPropsClosed<T> = Record<string, ComputedPropClosedFn<T>>;

export default function createComputedPropFunctions<T>(
  model: Model<T>,
  computedProps: ComputedProps<T>
): ComputedPropsClosed<T> {
  const computedPropsClosures = {};
  Object.keys(computedProps).forEach(key => {
    computedPropsClosures[key] = () => computedProps[key]({ ...model.data });
  });
  return computedPropsClosures;
}
