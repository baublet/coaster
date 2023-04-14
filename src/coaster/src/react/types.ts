import { EndpointInput } from "../endpoints/types";

export type CreateReactUiOptions = Partial<
  Pick<EndpointInput, "endpoint" | "middleware"> & {
    /**
     * The directory where your build files will be written. By default, Coaster
     * will build these files into a deterministic `node_modules/.coaster`
     * directory.
     */
    buildDir?: string;
    /**
     * When we serve this route's assets, if you want them served from a specific
     * subdirectory, you can specify it here. For example, if you want your assets
     * served from the root, use "/".
     *
     * Default: "assets"
     */
    assetsPath?: string;
  }
>;
