import type { UserInterface } from "@baublet/coaster";
import { createReactUi } from "@baublet/coaster/react";

export const endpoint: Promise<UserInterface> = createReactUi();
