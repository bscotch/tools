/**
 * @file index.ts
 *
 * Given a Git repo, `Informer` should be able to:
 *
 * - Open the root `package.json` and check for `workspaces`
 * - Open `versioner` configs (via Cosmic Config)
 * - Locate all packages and discern their relationships
 * - Read the Git history and, for each commit,
 *   determine in which package that commit's changes were made.
 * - Construct per-package changelogs using the commits
 *
 * *Ideally this would also handle version bumps...*
 */

export * from './Projects.js';

/**
 * # TODO
 *
 * - Discover package dependency relationships
 * - Flag version-coupled packages
 * - Read commit messages and determine which package they belong to
 * - Create per-package changelogs
 * - Add version-bumping
 *  - Read branch rules from config
 *  - Determine bump based on commits messages & branch rules
 *  - Bump version of all changed & coupled packages
 *    - Run `npm version` for each package
 *    - Create git tags for each package, prefixed with package name
 */
