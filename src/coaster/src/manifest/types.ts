import { ItemOrArrayOfItems } from "@baublet/coaster-utils";

export interface Manifest {
  name: string;
  port?: string;
  /**
   * An internal key used to identify this manifest. This should never change.
   * This is useful for orchestrating application-to-application communication.
   * If you don't provide this, your manifest name will be slugified and used.
   */
  key?: string;
  /**
   * Your application's Endpoint or Endpoints.
   */
  endpoints?: ItemOrArrayOfItems<string | FileDescriptor>;
  /**
   * The not-found handler for your application.
   */
  notFound?: string | FileDescriptor;
  /**
   * Application-level middleware to apply to all requests
   */
  middleware?: ItemOrArrayOfItems<string | FileDescriptor>;
}

export interface NormalizedManifest {
  __coasterManifestFullPath: string;
  name: string;
  port: string;
  key: string;
  endpoints: NormalizedFileDescriptor[];
  middleware: NormalizedFileDescriptor[];
  notFound: NormalizedFileDescriptor;
}

/**
 * Description of a manifest source file. A manifest source file exports a
 * single piece of your application's functionality, like a schema, or a
 * function that returns a schema.
 */
export interface FileDescriptor {
  file: string;
  exportName?: string;
}

export interface NormalizedFileDescriptor {
  file: string;
  exportName: string;
}

export type SingleFileDescriptorInput = string | FileDescriptor;
export type MultipleFileDescriptorInput = ItemOrArrayOfItems<
  string | FileDescriptor
>;
