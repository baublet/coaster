import { findFn } from "./findFn";
import { generateNames } from "../../helpers/generateNames";
import { prop } from "./createModel";

const withDefault = findFn({
  name: generateNames("test"),
  properties: {
    stringTest: prop("string"),
  },
});

const withDefaultResult: Promise<{ stringTest: string }> = withDefault("id");

const withOverride = findFn({
  name: generateNames("test"),
  properties: {
    stringTest: prop("string"),
  },
  methods: {
    find: () => "Hello world!",
  },
});

const withOverrideResult: "Hello world!" = withOverride();
