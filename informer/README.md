# Informer

The purpose of changelogs and release notes is to inform people of changes that are relevant to them. However, any given change may not be relevant to all users.

`Informer` is a utility that simplifies the process of creating, maintaining, and distributing changelogs and release notes.

## TODO

- Create a base configuration schema with defaults
- Create an inqurier (or enquirer) instance that can read the config information and run the user through the appropriate prompts
- Create a Change class that can parse data from Inquirer or a changes file
- Create an Informer class that can serve up the prompts, create/update files, and create commits.

## Terms & Concepts

- **Git commit message**: A summary attached to a git commit, describing what was changed since the prior commit.
- **Changelog**: A detailed list of changes made to a project. Informer uses "changelog" more or less synonymously with "git history". The target audience of a changelog consists of project maintainers. 
- **Release notes**: A summary of all changes made to a project since a prior release, written for a particular target audience.
- **Branch-Applicable Version**: A semver string satisfying branch-specific rules. For example, a `develop` branch might specify that only semver strings matching the pattern `^(\d+)(\.\d+){2}-rc\.0$` are applicable.
- **Package**: A project within a git repository that is versioned and needs changelogs/release notes.
- **Monorepo**: A git repository that contains multiple packages, each with its own distinct version, release, and changelog management.
- **Bump**: The act of incrementing a semver version string. As a prompt, a request for *which* part of the string should be versioned.

## Prior Art

The two popular projects that most closely resemble `Informer` are [changesets](https://github.com/changesets/changesets) and [beachball](https://microsoft.github.io/beachball/). Both are great tools for managing monorepos with distinct versions and release notes, but our use case requires additional/different features. In particular:

- Tighter coupling to git messages to reduce duplicate work.
- Less focus on Pull Request management.
- Flexible metadata and configuration options.
- Ability to apply branch rules to versioning and release note generation.
- Less specificity for `npm` package versioning and publishing.

## Approach

Dev runs a `git commit` as usual, but we have a hook that hijacks it and runs Inquirer to get details in a structured way. The dev is prompted to describe their change(s) based on the project and configuration details.

Once complete, a git commit is made with those details. Before making that commit, the same data is written to a next-version-changelog file in the project, with slightly different structure to conform to a well-defined Markdown output. That file accumulates changes as each commit is made.

On versioning, the next-version-changelog is renamed to the newest version and still stored as a single Markdown file.

The end result is a collection of Markdown files, one for each version (and project, for monorepos), that contain information and metadata about the changes. These can be edited over time, and each set of metadata can be mapped onto a commit in the git log if needed.

(On commit, all patchnotes files should be linted based on the current version of the config.)

Depending on needs for the project, these per-version changelogs can be used to generate any number of changelogs in any given format. RSS feeds, single "latest" notes, filtered views, etc. We'd just need a generic parser (which we'd need anyway) that can be made available to custom rendering engines.

### Examples

**Example prompts:**

- Loop addition of change:
  - Project(s) (for monorepos, described in config)
  - Target Audience (multi-select, from config)
  - Type of change (feature, fix, perf, etc (from config))
  - Bump (default based on types (modified by config))
  - Title of change
  - Description of change
  - Tags (from config)
  - Loop structured data (from config):
    - Field (from config)
    - Value (evaluated from config schema)

**Example output in git history:**

```
Title of first change.

Description of the change, blah blah blah
and some other stuff across a few lines, maybe.

Another paragraph, even. That's totally fine!

---
id: random-identifier
project: @bscotch/utility
audience: [aud1, aud2]
tags: [tag1, tag2]
type: feature
bump: patch
data: {field1: value1}
---

Title of second change.

# (You get the idea...)
```

Example output Markdown file:

```md
<!-- .patchnotes/{project}/{latestVersion}.next.md -->
## Title of first change.

Description of the change, blah blah blah
and some other stuff across a few lines, maybe.

Another paragraph, even. That's totally fine!

Some edits and stuff...

---
id: random-identifier
project: @bscotch/utility
audience: [aud1, aud2]
tags: [tag1, tag2]
type: feature
bump: patch
data: {field1: value1}

---

## Title of second change.

<!-- (You get the idea...) -->
```

**Example workflow & outcomes:**

If the dev is on the `develop` branch with most recent version commit `1.1.1-rc.0`, and they make a new commit:

1. The dev fills out the prompts to create the commit body
2. A new file named `.patchnotes/my-project/1.1.1-rc.0.next` is created (if it wasn't already)
3. The commit content is prepended to that file
4. The commit is finally made (or amended?)

The dev might go on to make more commits, or merge commits in from another branch, etc. At some point they'll decide to make a new version:

1. We'll have either hijacked the `npm preversion` hook, or we'll have a custom CLI command, either way we'll run a versioning command of some sort.
2. Before the version commit is created:
    - The `next` file is renamed to what the new version will be.
    - Any `.patchnotes` files that still have `.next` suffixes are deleted (this would have come from merges).
    - Any patchnote renderers are run to generate viewable patchnotes.
3. ... any other versioning stuff from other tools occurs

