import { ServiceArguments, Service, ServiceType } from "./types";

export function registerService<Args extends ServiceArguments>(
  args: Args
): Service {
  return (args as any) as Service;
}

// Type tests

export const service: Service = registerService({
  name: "Test service",
  type: ServiceType.GRAPHQL,
  port: 80,
  host: "0.0.0.0",
  options: {
    resolvers: {}
  }
});
