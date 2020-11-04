import { deleteFn } from "./deleteFn";
import { generateNames } from "../../helpers/generateNames";
import { prop } from "./createModel";

const withDefault = deleteFn({
  name: generateNames("test"),
  properties: {
    stringTest: prop("string"),
  },
});

const withDefaultResult: Promise<number> = withDefault("id");

const withOverride = deleteFn({
  name: generateNames("test"),
  properties: {
    stringTest: prop("string"),
  },
  methods: {
    delete: () => "Hello world!",
  },
});

const withOverrideResult: "Hello world!" = withOverride();
