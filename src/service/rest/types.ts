import { ServiceType, ServiceDefaultProperties } from "../types";

export interface RESTServiceOptions {
  routes: {};
}

export interface RESTServiceArguments extends ServiceDefaultProperties {
  type: ServiceType.REST;
  options: RESTServiceOptions;
}
