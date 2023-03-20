import type { ModuleMetadata } from "../manifest/types";

import type { CoasterTrack } from "../track/types";
import type { CreateReactTrackOptions } from "./types";

export async function createReactTrack(
  trackOptions: CreateReactTrackOptions
): Promise<(args: ModuleMetadata) => Promise<CoasterTrack>> {
  if (process.env.COASTER_WATCH === "true") {
    const { createDevelopmentReactTrack } = await import(
      "./createDevelopmentReactTrack"
    );
    return createDevelopmentReactTrack(trackOptions);
  } else {
    const { createReactTrack } = await import("./createReactProductionTrack");
    return createReactTrack(trackOptions);
  }
}
