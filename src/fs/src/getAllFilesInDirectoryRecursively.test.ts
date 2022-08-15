import { expect, it } from "@baublet/coaster-unit-test";

import { getAllFilesInDirectoryRecursively } from "./getAllFilesInDirectoryRecursively";

it("returns the right files in from our fixtures folder", async () => {
  await expect(
    getAllFilesInDirectoryRecursively(
      __dirname + "/fixtures/getAllFilesInDirectoryRecursively"
    )
  ).resolves.toEqual(
    expect.arrayContaining([
      expect.stringContaining("/getAllFilesInDirectoryRecursively/test.md"),
      expect.stringContaining(
        "/getAllFilesInDirectoryRecursively/test-deep/123.md"
      ),
      expect.stringContaining(
        "/getAllFilesInDirectoryRecursively/test123/new-file.md"
      ),
      expect.stringContaining(
        "/getAllFilesInDirectoryRecursively/test-deep/deeper/still.md"
      ),
    ])
  );
});
