import { Model } from "./createModel";
import protectedNames from "./protectedNames";

function propertyIsComputed(obj: Model, prop: string): boolean {
  return Object.keys(obj.$computed).includes(prop);
}

function propertyIsData(obj: Model, prop: string): boolean {
  return Object.keys(obj.$data).includes(prop);
}

function throwIfPropertyIsProtected(model: Model, prop: string): void {
  if (prop[0] === "$" || protectedNames.includes(prop)) {
    throw `${
      model.$name
    }.${prop} is invalid. ${prop} is a protected name. Please name your property something else or access it via and ${
      model.$name
    }.set("property", "value").`;
  }
}

function hasFn<T>() {
  return function has(obj: Model<T>, prop: string): boolean {
    if (propertyIsComputed(obj, prop) || propertyIsData(obj, prop)) {
      return true;
    }
    return false;
  };
}

function getFn<T>() {
  return function get(obj: Model<T>, prop: string): any {
    if (propertyIsComputed(obj, prop)) {
      return obj.$computed[prop]({ ...obj.$data });
    }
    return obj.$data[prop];
  };
}

function setFn<T>() {
  return function set(obj: Model<T>, prop: string, value: any) {
    throwIfPropertyIsProtected(obj, prop);
    if (propertyIsComputed(obj, prop)) return false;
    obj.$data[prop] = value;
    return true;
  };
}

function modelProxyHandler<T>(): ProxyHandler<Model<T>> {
  return { has: hasFn<T>(), get: getFn<T>(), set: setFn<T>() };
}

export default function proxyModel<T>(model: Model): Model {
  return new Proxy<Model>(model, modelProxyHandler<T>());
}
