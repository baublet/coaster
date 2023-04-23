import type { UserInterface } from "@baublet/coaster";
import { createReactUi } from "@baublet/coaster/react";

export const ui: Promise<UserInterface> = createReactUi();
