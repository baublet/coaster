import { Command as Program } from "commander";
import { serve } from "./cli/serve";

const program = new Program();
const version = require("../package.json").version;

(async () => {
  program
    .name("coaster")
    .description("Coaster framework CLI tools")
    .version(version);

  serve(program);

  await program.parseAsync();
})();
