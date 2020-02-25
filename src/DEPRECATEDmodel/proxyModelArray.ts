import { Model } from "./types";

function removeDeleted(modelArray: Model[]) {
  let i = modelArray.length;
  while (i--) {
    if (!modelArray[i].$deleted) continue;
    modelArray.splice(i, 1);
  }
}

export default function proxyModelArray(array: Model[]) {
  return new Proxy<Model[]>(array, {
    get: (models, key) => {
      removeDeleted(models);
      return models[key];
    },
    set: (models, key, value) => {
      removeDeleted(models);
      models[key] = value;
      return true;
    }
  });
}
