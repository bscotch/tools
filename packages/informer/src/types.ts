export interface PackageDotJson {
  name: string;
  version: string;
  workspaces?: string[];
}
export interface LernaConfig {
  packages?: string[];
  useWorkspaces?: boolean;
}
/**
 * Configuration information for the project. Values
 * can be provided via the {@link Project} constructor
 * or `informer` cosmiconfig settings.
 */
export interface ProjectConfig {
  /**
   * The packages managed by the project. Unless the project
   * is a monorepo, there will only be one!
   */
  versionGroups?: string[][];
}
export interface ProjectOptions extends ProjectConfig {
  /**
   * Project root directory. It should contain a `.git` folder,
   * a `package.json` file, and an optional `informer` config
   * following Cosmic Config's rules.
   *
   * Defaults to the current working directory.
   */
  dir?: string;
}
