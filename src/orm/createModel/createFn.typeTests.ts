import { createFn } from "./createFn";
import { generateNames } from "../../helpers/generateNames";
import { prop } from "./createModel";

const withDefault = createFn({
  name: generateNames("test"),
  properties: {
    stringTest: prop("string"),
  },
});

const withDefaultResult: Promise<{ stringTest: string }> = withDefault({
  stringTest: "123",
});

const withOverride = createFn({
  name: generateNames("test"),
  properties: {
    stringTest: prop("string"),
  },
  methods: {
    create: () => "Hello world!",
  },
});

const withOverrideResult: "Hello world!" = withOverride();
