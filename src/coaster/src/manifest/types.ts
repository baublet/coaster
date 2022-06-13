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
   * Your application's schema or schemas.
   */
  schemas?: string | string[] | FileDescriptor | FileDescriptor[];
  /**
   * Your application's component or components.
   */
  components?: string | string[] | FileDescriptor | FileDescriptor[];
  /**
   * Your application's Endpoint or Endpoints.
   */
  endpoints?: string | string[] | FileDescriptor | FileDescriptor[];
}

export interface NormalizedManifest {
  name: string;
  port: string;
  key: string;
  schemas: FileDescriptor[];
  components: FileDescriptor[];
  endpoints: FileDescriptor[];
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
