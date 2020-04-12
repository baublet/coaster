import {
  GraphQLServiceArguments,
  GraphQLServiceOptions
} from "./graphql/types";
import { RESTServiceArguments, RESTServiceOptions } from "./rest/types";
import DataLoader from "dataloader";
import { PersistedModel } from "persist/types";

export interface Service {
  name: string;
  host: string;
  port: number;
  protocol: string;
  initialize: () => Promise<void>;
  start: () => Promise<void>;
}

export enum ServiceType {
  GRAPHQL,
  REST,
  WEB
}

export type ServiceArguments = GraphQLServiceArguments | RESTServiceArguments;

export interface ServiceDefaultProperties {
  name: string;
  host?: string;
  port: number;
  type: ServiceType;
  options: GraphQLServiceOptions | RESTServiceOptions;
}

export interface ServiceContext {
  modelDataLoaders: Record<string, DataLoader<string, PersistedModel>>;
}
