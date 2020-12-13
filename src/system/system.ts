import { CoasterApplication, CoasterConfig, CoasterSystem } from "types";

export function system(config: CoasterConfig): CoasterSystem {
  const applicationCache: Record<
    string,
    CoasterApplication | Promise<CoasterApplication>
  > = {};

  const system: CoasterSystem = {} as any;

  const getApplication: CoasterSystem["getApplication"] = async (
    applicationName
  ) => {
    if (!applicationCache[applicationName]) {
      const applicationConfig = config.applications.find(
        (application) => application.name === applicationName
      );

      if (!applicationConfig) {
        throw new Error(
          `Coaster config searched for a system called ${applicationName}, but none existed in the configurations. Specified configurations: ${config.applications
            .map((app) => app.name)
            .join(", ")}`
        );
      }

      applicationCache[applicationName] = applicationConfig.driver(
        applicationConfig,
        system,
        config
      );
    }
    return applicationCache[applicationName];
  };

  system.getApplication = getApplication;
  system.getApplicationNames = () => Object.keys(applicationCache);

  return system;
}
