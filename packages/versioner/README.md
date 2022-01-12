# Bscotch Versioner (BSV)

When a collection of changes to a project are ready to be released, whether to internal or external audiences, we apply a version number to the poject in that snapshot state.

We use [semver](http://semver.org/) strings to communicate information about version changes.

The versioning process can vary quite a bit by project, and is typically coupled to some number of other automated or manual processes. Versioning may occur on a remote server, during CI/CD pipeline processes, or locally. It may include build, publishing, and/or testing processes.

This all gets further complicated by mono-repo contexts, where there are multiple sub-projects that each might have their own version, or be coupled to another sub-project's version, or have one sub-project as a dependency.

It gets even *more* complicated when we want to use common tooling for different kinds of projects. In our case, we have packages we want to deploy to npm (both public and private) and games we want to deploy to build machines for internal QA.

The Bscotch Versioner (<abbr title="Bscotch Versioner">BSV</abbr>") aims to enable the version-management aspect of a project without making too many assumptions or getting in the way of other functionalily commonly associated with versioning. It does this by focusing *only* on versioning, and providing programmatic use along with extensive configuration options.

## Installation

- Run `npm install @bscotch/versioner` (for global install run `npm install -g @bscotch/versioner`).

## Usage

A BSV-managed project's configuration includes:

- Versioning rules
- Versioning lifecycle hooks
- Versioning behavior (e.g. whether to commit after versioning, what files should be updated, etc.)
- Versioning commit & tag formats

All of these are managed on a per-project basis via a root configuration (or CLI options), allowing usage in both monorepo (multiple projects in one Git repo) and single-project contexts.

To use the versioner, you must create a configuration file (use `bsv init` to create a default one) and keep it up to date based on your project structure. Configuration uses [cosmiconfig](https://github.com/davidtheclark/cosmiconfig), so the config information can be provided in a number of ways (use the module name `bsv`).


