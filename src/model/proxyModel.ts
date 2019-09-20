import { Model, ModelInternalProperties, ModelData } from "./createModel";

function propertyIsComputed(obj: Model, prop: string): boolean {
  return Object.keys(obj.$computed).includes(prop);
}

function propertyIsRelationship(obj: Model, prop: string): boolean {
  return Object.keys(obj.$relationships).includes(prop);
}

function propertyIsData(obj: Model, prop: string): boolean {
  return Object.keys(obj.$data).includes(prop);
}

function applyFn() {
  return function apply(obj: ModelInternalProperties) {
    return obj.$data;
  };
}

function hasFn() {
  return function has(obj: ModelInternalProperties, prop: string): boolean {
    if (propertyIsComputed(obj, prop) || propertyIsData(obj, prop)) {
      return true;
    }
    return false;
  };
}

function getFn() {
  return function get(obj: ModelInternalProperties, prop: string): any {
    const validate = () =>
      obj.$validate(obj.$data, obj.$computed, obj.$validators);
    switch (prop) {
      case "$isModel":
        return true;
      case "$deleted":
        return obj.$deleted;
      case "$factory":
        return obj.$factory;
      case "$hooks":
        return obj.$hooks;
      case "$setRelationship":
        return (key: string, model: ModelInternalProperties) => {
          obj.$relationships[key] = model;
        };
      case "$setData":
        return (data: ModelData): void => {
          obj.$data = data;
        };
      case "valid":
        return validate() === true;
      case "errors":
        // eslint-disable-next-line no-case-declarations
        const valid = validate();
        return validate() === true ? [] : valid;
      case "delete":
        // Mark it for deletion in the relationship
        obj.$deleted = true;
        return obj[prop];
      case "save":
        return obj[prop];
      case "reload":
        return obj[prop];
    }
    if (propertyIsComputed(obj, prop)) {
      return obj.$computed[prop]({ ...obj.$data });
    }
    if (propertyIsRelationship(obj, prop)) {
      // Filter deleted
      if (Array.isArray(obj.$relationships[prop])) {
        obj.$relationships[prop] = obj.$relationships[prop].filter(
          model => !model.$deleted
        );
      } else if (
        obj.$relationships[prop] &&
        obj.$relationships[prop].$deleted
      ) {
        obj.$relationships[prop] = null;
      }
      return obj.$relationships[prop];
    }
    return obj.$data[prop];
  };
}

function setFn() {
  return function set(obj: ModelInternalProperties, prop: string, value: any) {
    if (propertyIsRelationship(obj, prop)) {
      obj.$relationships[prop] = value;
      return true;
    }
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
  return { has: hasFn(), get: getFn(), set: setFn(), apply: applyFn() };
}

export default function proxyModel(model: Model): Model {
  return new Proxy<Model>(model, modelProxyHandler());
}
