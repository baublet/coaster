#!/usr/bin/env node node_modules/.bin/ts-node

import yargs from "yargs/yargs";

import { commands } from "./commands";

const builder = yargs(process.argv.slice(2));

commands(builder);

builder.demandCommand().help().wrap(72).argv;
