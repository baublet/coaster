import { object, array, string } from "yup";
import JSON5 from "json5";
import { readFile } from "@baublet/coaster-fs";

import { Manifest } from "./types";
import { CoasterError, isCoasterError } from "@baublet/coaster-utils";

export async function loadRawManifest(
  path: string,
  options: Parameters<typeof readFile>[1]
): Promise<Manifest | CoasterError> {
  const manifestString = await readFile(path, options);

  if (isCoasterError(manifestString)) {
    return manifestString;
  }

  const manifest: unknown = JSON5.parse(manifestString);
  const castedValue: any = rawManifestSchema.cast(manifest);

  return castedValue;
}

const fileDescriptorSchema = object({
  file: string().required(),
  exportName: string(),
});

export const rawManifestSchema = object({
  name: string().required(),
  port: string().required(),
  key: string(),

  schema: fileDescriptorSchema,
  schemas: array(fileDescriptorSchema),

  component: fileDescriptorSchema,
  components: array(fileDescriptorSchema),

  endPoint: fileDescriptorSchema,
  endPoints: array(fileDescriptorSchema),
});
