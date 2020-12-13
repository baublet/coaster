import { IncomingHttpHeaders } from "http";

import {
  CoasterGraphQLApplicationConfiguration,
  CoasterHttpApplicationConfiguration,
} from "./drivers";

export interface CoasterConfig {
  applications: CoasterApplicationConfiguration[];
}

export type CoasterApplicationConfiguration =
  | CoasterGraphQLApplicationConfiguration
  | CoasterHttpApplicationConfiguration;

export interface CoasterApplicationConfigurationBase {
  /**
   * Short name of the application for internal debugging purposes.
   */
  name: string;
  /**
   * Method by which this application will be executed. Requires an object compatible with the CoasterApplication interface
   */
  driver: CoasterApplicationFactory;
}

export interface CoasterRequest {
  method: "get" | "post" | "put" | "patch" | "options" | "delete";
  body: any;
  headers: IncomingHttpHeaders;
  domain: string;
  path: string;
  originalUrl: string;
  parameters: Record<string, any>;
}

export interface CoasterResponse {
  status: (status: number) => void;
  headers: Map<string, any>;
  send: (data: any, status?: number) => void;
  end: (status?: number) => void;
}

export type CoasterApplicationFactory = (
  applicationConfig: CoasterApplicationConfiguration,
  system: CoasterSystem,
  systemConfig: CoasterConfig
) => CoasterApplication | Promise<CoasterApplication>;

export type CoasterRequestHandler = (
  request: CoasterRequest,
  response: CoasterResponse
) => void | Promise<void>;

export interface CoasterApplication {
  initialize: () => void | Promise<void>;
  teardown: () => void | Promise<void>;
  handleRequest: CoasterRequestHandler;
}

export type CoasterSystemFactory = (config: CoasterConfig) => CoasterSystem;

export interface CoasterSystem {
  getApplicationNames(): string[];
  getApplication(application: string): Promise<CoasterApplication>;
}
