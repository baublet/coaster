import { Command as Program } from "commander";
import { serve } from "./cli/serve";
import { build } from "./cli/build";

const program = new Program();
const version = require("../package.json").version;

(async () => {
  program
    .name("coaster")
    .description("Coaster framework CLI tools")
    .version(version);

  serve(program);
  build(program);

  await program.parseAsync();
})();
