import { saveFn } from "./saveFn";
import { generateNames } from "../../helpers/generateNames";
import { prop } from "./createModel";

const placeholderModelDetails = {} as any;

const withDefault = saveFn(
  {
    name: generateNames("test"),
    properties: {
      stringTest: prop("string"),
    },
  },
  placeholderModelDetails
);

const withDefaultResult: Promise<{ stringTest: string }> = withDefault({
  stringTest: "123",
});

const withOverride = saveFn(
  {
    name: generateNames("test"),
    properties: {
      stringTest: prop("string"),
    },
    methods: {
      save: () => "Hello world!",
    },
  },
  placeholderModelDetails
);

const withOverrideResult: "Hello world!" = withOverride();
