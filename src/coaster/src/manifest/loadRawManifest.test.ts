import { it, expect, coasterTest, describe } from "@baublet/coaster-unit-test";
import { createCoasterError } from "@baublet/coaster-utils";
import * as fs from "@baublet/coaster-fs";

import { loadRawManifest } from "./loadRawManifest";

const readFileSpy = coasterTest.spyOn(fs, "readFile").mockResolvedValue("{}");

it("returns an error when we can't read the file", async () => {
  const error = createCoasterError({
    code: "readFile-error",
    message: "Error reading file",
  });

  readFileSpy.mockResolvedValue(error);

  await expect(loadRawManifest("stub")).resolves.toEqual(error);
});

it("returns an error if there's a parsing problem", async () => {
  readFileSpy.mockResolvedValue("{}");

  await expect(loadRawManifest("stub")).resolves.toMatchInlineSnapshot(
    `
    {
      "__isCoasterError": true,
      "code": "cGFyc2VNYW5pZmVzdC1uYW1l",
      "error": undefined,
      "message": "Expected manifest name to be a string, got a undefined",
    }
  `
  );
});

it("returns the manifest is all else is well", async () => {
  readFileSpy.mockResolvedValue(`{
    "name": "stub",
    "port": "8888"
  }`);

  await expect(loadRawManifest("stub")).resolves.toEqual({
    name: "stub",
    key: "stub",
    port: "8888",
    components: [],
    schemas: [],
    endpoints: [],
  });
});

describe("various file errors", () => {
  it("returns error if the file isn't JSON", () => {
    readFileSpy.mockResolvedValue("not json");

    return expect(loadRawManifest("stub")).resolves.toMatchInlineSnapshot(`
      {
        "__isCoasterError": true,
        "code": "bG9hZFJhd01hbmlmZXN0LXBhcnNlRXJyb3I=",
        "error": {
          "message": "JSON5: invalid character 'o' at 1:2",
          "stack": "SyntaxError: JSON5: invalid character 'o' at 1:2
          at syntaxError (/home/baublet/coaster/node_modules/json5/lib/parse.js:1083:17)
          at invalidChar (/home/baublet/coaster/node_modules/json5/lib/parse.js:1028:12)
          at literal (/home/baublet/coaster/node_modules/json5/lib/parse.js:700:19)
          at Object.value (/home/baublet/coaster/node_modules/json5/lib/parse.js:224:13)
          at lex (/home/baublet/coaster/node_modules/json5/lib/parse.js:78:42)
          at Object.parse (/home/baublet/coaster/node_modules/json5/lib/parse.js:25:17)
          at Module.loadRawManifest (/home/baublet/coaster/src/coaster/src/manifest/loadRawManifest.ts:16:52)
          at async runTest (/home/baublet/coaster/node_modules/vitest/dist/entry.js:801:5)
          at async runSuite (/home/baublet/coaster/node_modules/vitest/dist/entry.js:866:13)
          at async runSuite (/home/baublet/coaster/node_modules/vitest/dist/entry.js:866:13)",
        },
        "message": "Error parsing manifest file: stub",
      }
    `);
  });

  it("returns error if the root node isn't an object", () => {
    readFileSpy.mockResolvedValue("[]");

    return expect(loadRawManifest("stub")).resolves.toMatchInlineSnapshot(`
      {
        "__isCoasterError": true,
        "code": "cGFyc2VNYW5pZmVzdC1yb290Tm9kZQ==",
        "error": undefined,
        "message": "Expected manifest root node an object, got a object",
      }
    `);
  });

  it("returns error if the name isn't a string", () => {
    readFileSpy.mockResolvedValue("{ name: 123 }");

    return expect(loadRawManifest("stub")).resolves.toMatchInlineSnapshot(`
      {
        "__isCoasterError": true,
        "code": "cGFyc2VNYW5pZmVzdC1uYW1l",
        "error": undefined,
        "message": "Expected manifest name to be a string, got a number",
      }
    `);
  });

  it("returns error if the port isn't a numeric string", () => {
    readFileSpy.mockResolvedValue("{ name: 'name', port: 'port' }");

    return expect(loadRawManifest("stub")).resolves.toMatchInlineSnapshot(`
      {
        "__isCoasterError": true,
        "code": "cGFyc2VNYW5pZmVzdC1wb3J0LW5vdEFOdW1iZXI=",
        "error": undefined,
        "message": "Expected manifest port to be a numeric string or number, got port",
      }
    `);
  });

  it("returns error if the port isn't a whole number", () => {
    readFileSpy.mockResolvedValue("{ name: 'name', port: '123.5' }");

    return expect(loadRawManifest("stub")).resolves.toMatchInlineSnapshot(`
      {
        "__isCoasterError": true,
        "code": "cGFyc2VNYW5pZmVzdC1wb3J0LWZsb2F0",
        "error": undefined,
        "message": "Expected manifest port to be a whole number, got 123.5",
      }
    `);
  });

  it("returns error if the port is infinity", () => {
    readFileSpy.mockResolvedValue("{ name: 'name', port: Infinity }");

    return expect(loadRawManifest("stub")).resolves.toMatchInlineSnapshot(`
      {
        "__isCoasterError": true,
        "code": "cGFyc2VNYW5pZmVzdC1wb3J0LWluZmluaXR5",
        "error": undefined,
        "message": "Expected manifest port to be a numeric string or number, got Infinity",
      }
    `);
  });

  it("returns error if the port is out of range", () => {
    readFileSpy.mockResolvedValue("{ name: 'name', port: 655350 }");

    return expect(loadRawManifest("stub")).resolves.toMatchInlineSnapshot(`
      {
        "__isCoasterError": true,
        "code": "cGFyc2VNYW5pZmVzdC1wb3J0LXJhbmdl",
        "error": undefined,
        "message": "Expected manifest port to be a number between 0 and 65535, got 655350",
      }
    `);
  });
});
