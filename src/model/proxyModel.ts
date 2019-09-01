import { Model, ModelInternalProperties, ModelData } from "./createModel";
import protectedNames from "./protectedNames";

function propertyIsComputed(obj: Model, prop: string): boolean {
  return Object.keys(obj.$computed).includes(prop);
}

function propertyIsRelationship(obj: Model, prop: string): boolean {
  return Object.keys(obj.$relationships).includes(prop);
}

function propertyIsData(obj: Model, prop: string): boolean {
  return Object.keys(obj.$data).includes(prop);
}

function throwIfPropertyIsProtected(model: Model, prop: string): void {
  if (prop[0] === "$" || protectedNames.includes(prop)) {
    throw `${model.$name}.${prop} is invalid. ${prop} is a protected name. Please name your property something else or access it via and ${model.$name}.set("property", "value").`;
  }
}

function hasFn<T>() {
  return function has(obj: ModelInternalProperties, prop: string): boolean {
    if (propertyIsComputed(obj, prop) || propertyIsData(obj, prop)) {
      return true;
    }
    return false;
  };
}

function getFn<T>() {
  return function get(obj: ModelInternalProperties, prop: string): any {
    switch (prop) {
      case "$setRelationship":
        return (key: string, model: ModelInternalProperties) => {
          obj.$relationships[key] = model;
        };
      case "$setData":
        return (data: ModelData<T>): void => {
          obj.$data = data;
        };
      case "save":
      case "delete":
      case "reload":
        return obj[prop];
    }
    if (propertyIsComputed(obj, prop)) {
      return obj.$computed[prop]({ ...obj.$data });
    }
    if (propertyIsRelationship(obj, prop)) {
      return obj.$relationships[prop];
    }
    if (prop === "$factory") {
      return obj.$factory;
    }
    return obj.$data[prop];
  };
}

function setFn<T>() {
  return function set(obj: ModelInternalProperties, prop: string, value: any) {
    throwIfPropertyIsProtected(obj, prop);
    if (prop === "$dangerouslySetRelationships") {
      obj.$relationships = value;
      return true;
    }
    if (propertyIsComputed(obj, prop)) return false;
    obj.$data[prop] = value;
    return true;
  };
}

function modelProxyHandler(): ProxyHandler<any> {
  return { has: hasFn(), get: getFn(), set: setFn() };
}

export default function proxyModel(model: Model): Model {
  return new Proxy<Model>(model, modelProxyHandler());
}
