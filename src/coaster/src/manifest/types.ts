export interface Manifest {
  name: string;
  port: string;
  /**
   * An internal key used to identify this manifest. This should never change.
   * This is useful for orchestrating application-to-application communication.
   * If you don't provide this, your manifest name will be slugified and used.
   */
  key?: string;
  /**
   * Your application's schema or schemas.
   */
  schema?: FileDescriptor;
  schemas?: FileDescriptor[];
  /**
   * Your application's component or components.
   */
  component?: FileDescriptor;
  components?: FileDescriptor[];
  /**
   * Your application's endpoint or endpoints.
   */
  endPoint?: FileDescriptor;
  endPoints?: FileDescriptor[];
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
