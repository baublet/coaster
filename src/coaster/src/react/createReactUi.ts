import type { CreateReactUiOptions } from "./types";
import { UserInterface } from "../ui/types";

export async function createReactUi(
  trackOptions: CreateReactUiOptions = {}
): Promise<UserInterface> {
  if (process.env.COASTER_WATCH === "true") {
    const { createDevelopmentReactUi: createDevelopmentReactTrack } =
      await import("./createDevelopmentReactUi");
    return createDevelopmentReactTrack(trackOptions);
  } else {
    const { createReactUi: createReactTrack } = await import(
      "./createReactProductionUi"
    );
    return createReactTrack(trackOptions);
  }
}
