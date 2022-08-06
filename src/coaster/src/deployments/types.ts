import { CoasterError } from "@baublet/coaster-utils";

import { CoasterDeploymentContext } from "../context/deployment";

export interface NormalizedDeploymentBase {
  name: string;
  /**
   * Unique key of the deployment for defining dependencies between steps
   */
  key: string;
  /**
   * If this deployment step relies on any other step, use this to tell coaster
   * to wait until these other steps are done before starting this step.
   */
  dependencies: string[];
  /**
   * During a deployment, Coaster does not show any output unless there are errors.
   * We do, however, log the output to disk. By default, we log output to the
   * system's temporary folders, but if you want to customize them, use this.
   */
  logLocations: {
    stdout: string;
    stderr: string;
    consolidated: string;
  };
}

export interface NormalizedDeploymentCommand extends NormalizedDeploymentBase {
  type: "command";
  /**
   * The shell to use. Defaults to bash
   */
  shell: string;
  /**
   * The command to run using the above shell.
   */
  command: string;
  /**
   * If the dependency should run in accordance with the dependency tree, but
   * you want more granular control over whether to run the step, use this. Runs
   * just before the deployment would otherwise run.
   */
  shouldRun?: (args: {
    context: CoasterDeploymentContext;
    dependency: NormalizedDeploymentCommand;
  }) => Promise<{ shouldRun: boolean; reason?: string } | CoasterError>;
}

export interface NormalizedDeploymentFunction extends NormalizedDeploymentBase {
  type: "function";
  handler: (args: {
    context: CoasterDeploymentContext;
    dependency: NormalizedDeploymentFunction;
  }) => Promise<void>;
  /**
   * If the dependency should run in accordance with the dependency tree, but
   * you want more granular control over whether to run the step, use this. Runs
   * just before the deployment would otherwise run.
   */
  shouldRun?: (args: {
    context: CoasterDeploymentContext;
    dependency: NormalizedDeploymentFunction;
  }) => Promise<{ shouldRun: boolean; reason: string } | CoasterError>;
}

export type NormalizedDeployment =
  | NormalizedDeploymentFunction
  | NormalizedDeploymentCommand;
