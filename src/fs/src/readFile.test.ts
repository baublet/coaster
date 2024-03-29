import fs from "fs";

import { coasterTest, it, expect } from "@baublet/coaster-unit-test";

import { readFile } from "./readFile";

const fsSpy = coasterTest.spyOn(fs, "readFile");

it("reads a file from disk", async () => {
  await expect(readFile(__dirname + "/readFile.test.ts")).resolves.toBeTruthy();
});

it("hits the cache if necessary", async () => {
  await expect(
    readFile(__dirname + "/readFile.test.ts", { cache: true })
  ).resolves.toBeTruthy();

  expect(fsSpy).toHaveBeenCalledTimes(1);
});
