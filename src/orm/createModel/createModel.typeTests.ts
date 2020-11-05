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

const WithRelationships = createModel({
  name: generateNames("WithRelationships"),
  properties: {
    id: prop("string"),
    name: prop("string"),
    fooId: prop("string"),
  },
})
  // @ts-expect-error
  .withOneToOneRelationship("name", { of: test, localKey: "fooId" })
  .withOneToOneRelationship("foo", { of: test, localKey: "fooId" })
  // @ts-expect-error
  .withOneToOneRelationship("foo", {
    of: test,
    localKey: "fooId",
    nullable: true,
  })
  // @ts-expect-error
  .withOneToOneRelationship("foo2", { of: test, localKey: "not a real key" });

async () => {
  const withRelationshipsModel = await WithRelationships.create({
    name: "name",
  });
  const foo = await withRelationshipsModel.foo();
  // @ts-expect-error
  foo.booleanTest = "true";
  foo.booleanTest = true;
};
