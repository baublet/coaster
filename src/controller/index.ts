export type ControllerResponse = Record<string, any>;

export enum ControllerResourceType {
  REST,
  GRAPHQL
}

export type ControllerArguments = Record<string, string>;
export interface ControllerContext extends Record<string, any> {
  headers: Record<string, string>;
  cookies: Record<string, string>;
}

export type Controller = ({
  args: ControllerArguments,
  context: ControllerContext,
  type: ControllerResourceType,
  uri: string
}) => Promise<ControllerResponse>;
