import { ModelOptionsHooks, ModelDataDefaultType, Model } from "model/types";

// When a model is initialized, before we finish up proxying everything,
// we run the initial data through beforeCreate hooks
export interface BeforeCreateHookArguments {
  initialData: ModelDataDefaultType;
}
export type BeforeCreateHook = (args: BeforeCreateHookArguments) => void;

// Once the model is created, we pass the final model through these
export interface AfterCreateHookArguments {
  model: Model;
}
export type AfterCreateHook = (args: AfterCreateHookArguments) => void;

// Before we run the save hook, we run the data through these hooks
export interface BeforeSaveHookArguments {
  model: Model;
}
export type BeforeSaveHook = (args: BeforeSaveHookArguments) => Promise<void>;

export interface ModelHooks {
  beforeCreate: BeforeCreateHook[];
  afterCreate: AfterCreateHook[];

  beforeSave: BeforeSaveHook[];
}

export type NormalizedHooksMap = Record<string, ((args: any) => void)[]>;

export const hookDefaults = () => ({
  beforeCreate: [],
  afterCreate: [],
  beforeSave: []
});

// Normalize hook nodes into proper arrays
export default function normalizeHooks(
  hooks: ModelOptionsHooks
): NormalizedHooksMap {
  const normalizedHooks: NormalizedHooksMap = Object.assign(
    hookDefaults(),
    hooks
  );
  Object.keys(normalizedHooks).forEach(key => {
    const hookNode = normalizedHooks[key];
    if (Array.isArray(hookNode)) return;
    if (typeof hookNode !== "function") {
      normalizedHooks[key] = [];
    } else {
      normalizedHooks[key] = [hookNode];
    }
  });
  return normalizedHooks;
}
