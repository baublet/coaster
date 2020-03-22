export enum ControllerResourceType {
  REST,
  GRAPHQL
}

export type ControllerArguments = Record<string, any>;
export type ControllerReturn = Record<string, any>;
export type ControllerMethods =
  | "post"
  | "put"
  | "patch"
  | "get"
  | "options"
  | "delete";

export interface ControllerContext extends Record<string, any> {
  headers: Record<string, string>;
  cookies: Record<string, string>;
}

export type Controller<
  ControllerArgs extends ControllerArguments,
  ControllerReturnStructure extends ControllerReturn
> = ({
  args: ControllerArgs,
  context: ControllerContext,
  type: ControllerResourceType,
  uri: string,
  method: ControllerMethods
}) => Promise<ControllerReturnStructure>;
