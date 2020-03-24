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

interface ControllerProperties<ControllerArgs extends ControllerArguments> {
  args: ControllerArgs;
  context: ControllerContext;
  type: ControllerResourceType;
  uri: string;
  method: ControllerMethods;
}

export type Controller<
  ControllerArgs extends ControllerArguments,
  ControllerReturnStructure extends ControllerReturn
> = (
  controllerProperties: ControllerProperties<ControllerArgs>
) => Promise<ControllerReturnStructure>;

// ! ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// ! Type tests
// ! ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

export type _ControllerPropertiesTest = ControllerProperties<{
  id: string;
  limit?: number;
  arrayOfStrings?: string[];
}>;

export const _controllerPropertiesTest: _ControllerPropertiesTest = {
  args: {
    id: "11", // Fails if absent
    // id: 1, // Fails
    limit: 1,
    arrayOfStrings: ["1", "2"]
  },
  context: 1 as any,
  type: 1 as any,
  uri: 1 as any,
  method: 1 as any
};
