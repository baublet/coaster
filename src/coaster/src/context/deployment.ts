import { ServiceContainer } from "@baublet/service-container";

import { NormalizedDeployment } from "../deployments/types";

export interface CoasterDeploymentContext {
  services: ServiceContainer;
  startTime: Date;
  steps: NormalizedDeployment[];
}
