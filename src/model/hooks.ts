// When a model is initialized, before we finish up proxying everything,
// we run the initial data through beforeCreate hooks
export type BeforeCreateHook = ({ initialData: ModelDataDefaultType }) => void;

// Once the model is created, we pass the final model through these
export type AfterCreateHook = ({ model: Model }) => void;

// Before we run the save hook, we run the data through these hooks
export type BeforeSaveHook = ({ model: Model }) => Promise<void>;

export interface ModelHooks {
  beforeCreate: BeforeCreateHook[];
  afterCreate: AfterCreateHook[];

  beforeSave: BeforeSaveHook[];
}

export const hookDefaults = () => ({
  beforeCreate: [],
  afterCreate: [],
  beforeSave: []
});
