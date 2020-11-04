import { generateNames } from "../helpers";
import { prop, nullable, createModel } from "./createModel";
import {
  CreateModelArguments,
  CustomMethodOr,
  Model,
  RecordFromTypeWithOptionals,
} from "./types";

const testRecord = { required: 123, maybe: 321 };
type TestRecordType = RecordFromTypeWithOptionals<typeof testRecord, "maybe">;
const typedTestRecordTest1: TestRecordType = {
  required: 123,
};
const typedTestRecordTest4: TestRecordType = {
  // @ts-expect-error
  required: "string",
};
const typedTestRecordTest2: TestRecordType = {
  required: 123,
  maybe: 321,
};
// @ts-expect-error
const typedTestRecordTest3: TestRecordType = {
  maybe: 321,
};
const typedTestRecordTest6: TestRecordType = {
  // @ts-expect-error
  notAProp: 321,
};

function customMethods<T extends CreateModelArguments>(
  args: T
): CustomMethodOr<T, "create", () => "Hi!"> {
  return {} as CustomMethodOr<T, "create", () => "Hi!">;
}

const customMethodsModel = customMethods({
  name: generateNames("lol"),
  properties: {},
  methods: {
    create: () => "not hi!",
  },
});

const customMethodFn: "not hi!" = customMethodsModel();
// @ts-expect-error
const customMethodFnFail: "Hi!" = customMethodsModel();

const customMethodsModelDefault = customMethods({
  name: generateNames("lol"),
  properties: {},
});

// @ts-expect-error
const customMethodsModelDefaultFn: "not hi!" = customMethodsModelDefault();
const customMethodsModelDefaultFnFail: "Hi!" = customMethodsModelDefault();
