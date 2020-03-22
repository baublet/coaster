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
  Args extends ControllerArguments,
  Return extends ControllerReturn
> = ({
  args: Args,
  context: ControllerContext,
  type: ControllerResourceType,
  uri: string,
  method: ControllerMethods
}) => Promise<Return>;
