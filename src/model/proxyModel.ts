import { Model, ModelInternalProperties, ModelData } from "./types";

function propertyIsComputed(
  obj: ModelInternalProperties,
  prop: string
): boolean {
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
  return function has(
    obj: ModelInternalProperties & Model,
    prop: string
  ): boolean {
    if (propertyIsComputed(obj, prop) || propertyIsData(obj, prop)) {
      return true;
    }
    return false;
  };
}

function nativeProperties(obj: ModelInternalProperties) {
  return () => Object.assign({}, obj.$data);
}

function getFn() {
  return function get(obj: ModelInternalProperties & Model, prop: string): any {
    const validate = () =>
      obj.$validate(obj.$data, obj.$computed, obj.$validators);
    switch (prop) {
      case "$deleted":
        return obj.$deleted;
      case "$factory":
        return obj.$factory;
      case "$hooks":
        return obj.$hooks;
      case "$isModel":
        return true;
      case "$nativeProperties":
        return nativeProperties(obj);
      case "$setDeleted":
        return (deleted: boolean) => {
          obj.$deleted = deleted;
        };
      case "$setRelationship":
        return (key: string, model: Model) => {
          obj.$relationships[key] = model;
        };
      case "$setData":
        return (data: ModelData): void => {
          obj.$data = data;
        };
      case "errors":
        // eslint-disable-next-line no-case-declarations
        const valid = validate();
        return validate() === true ? [] : valid;
      case "toJson":
        return () => Object.assign({}, obj.$data);
      case "valid":
        return validate() === true;
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
  return function set(
    obj: Model & ModelInternalProperties,
    prop: string,
    value: any
  ) {
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
