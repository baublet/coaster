import { CoasterError } from "@baublet/coaster-utils";

import { CoasterDeploymentContext } from "../context/deployment";
import { FileDescriptor } from "../manifest/types";

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
}

export interface NormalizedDeploymentFunction extends NormalizedDeploymentBase {
  type: "function";
  handler: (args: {
    context: CoasterDeploymentContext;
    dependency: NormalizedDeploymentFunction;
  }) => Promise<void>;
}

export type NormalizedDeployment =
  | NormalizedDeploymentFunction
  | NormalizedDeploymentCommand;

export interface ManifestDeploymentBase {
  /**
   * Nice name for this deployment step
   */
  name: string;
  /**
   * Unique key of the deployment for defining dependencies between steps. If
   * not supplied, uses `name`, instead. Must not conflict with other keys.
   */
  key?: string;
  /**
   * If this deployment step relies on any other step, use this to tell Coaster
   * to wait until these other steps are done before starting this step. The
   * steps are represented by their keys (or, if the key is not supplied, their
   * name).
   */
  dependencies?: string[];
  /**
   * Allows you to set environment variables for this step, passed either to
   * Bash or Node, depending on the step.
   */
  environment?: Record<string, string | boolean | number | undefined>;
}

export interface ManifestDeploymentFile {
  /**
   * A reference to the file that contains the deployment step. The file must
   * export the proper child, or the deployment step will fail.
   */
  file: string | FileDescriptor;
}

export interface ManifestDeploymentFile {
  /**
   * A reference to the file that contains the deployment step. The file must
   * export the proper child, or the deployment step will fail.
   */
  command: string | FileDescriptor;
  /**
   * Shell to use to run the command.
   */
  shell?: string;
}
