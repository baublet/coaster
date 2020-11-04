import { Model } from "../types";
import { generateNames } from "../../helpers/generateNames";
import { createModel, nullable, prop } from "./createModel";

const test = createModel({
  name: generateNames("Test"),
  properties: {
    stringTest: prop("string"),
    numberTest: prop("number"),
    booleanTest: prop("boolean"),
    nullableStringTest: nullable("string"),
    nullableNumberTest: nullable("number"),
    nullableBooleanTest: nullable("boolean"),
  },
});

test.$nullableKeyType = "nullableStringTest";
test.$nullableKeyType = "nullableNumberTest";
test.$nullableKeyType = "nullableBooleanTest";
// @ts-expect-error
test.$nullableKeys = "stringTest";
// @ts-expect-error
test.$nullableKeys = "numberTest";
// @ts-expect-error
test.$nullableKeys = "booleanTest";

test.$modelPrimitiveTypes.stringTest = "string";
// @ts-expect-error
test.$modelPrimitiveTypes.stringTest = 1;
// @ts-expect-error
test.$modelPrimitiveTypes.stringTest = true;
// @ts-expect-error
test.$modelPrimitiveTypes.stringTest = false;

test.$modelPrimitiveTypes.numberTest = 1;

test.$modelPrimitiveTypes.booleanTest = true;

test.$modelPrimitiveTypes.nullableBooleanTest = null;
test.$modelPrimitiveTypes.nullableBooleanTest = true;

type TestModel = Model<typeof test>;
const testModel: TestModel = {
  booleanTest: true,
  numberTest: 321,
  stringTest: "hello",
};

// @ts-expect-error
const testModel2: TestModel = {
  booleanTest: true,
};
