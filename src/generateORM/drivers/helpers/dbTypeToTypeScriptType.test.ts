import { dbTypeToTypeScriptType } from "./dbTypeToTypeScriptType";

it("returns JSON", () => {
  expect(dbTypeToTypeScriptType("jsona")).toEqual("AnyJson");
});

it("returns string", () => {
  expect(dbTypeToTypeScriptType("text")).toEqual("string");
});

it("returns Date", () => {
  expect(dbTypeToTypeScriptType("timestamp")).toEqual("Date");
});

it("returns number", () => {
  expect(dbTypeToTypeScriptType("decimal")).toEqual("number");
});

it("returns boolean", () => {
  expect(dbTypeToTypeScriptType("bool")).toEqual("boolean");
});

it("returns unknown", () => {
  expect(dbTypeToTypeScriptType("fdsaasdf")).toEqual("unknown");
});

it("returns enums", () => {
  expect(dbTypeToTypeScriptType("USER-DEFINED")).toEqual("enum");
});
