# Contributing <a id="contribute"></a>

## Issues and Suggestions

If you discover bugs or missing features, please post them as GitHub issues. Be extremely detailed and thorough in your explanation of the issue/suggestion and why it's important to address it.

Note that it will not be a high priority for the Bscotch team to address issues and feature that we ourselves don't actively need. To make your own fixes/features, see the next section.

## Contributing Code

The fastest way to get fixes and features is to submit them yourself! By forking this repo and making changes, you can have your own version that works however you want.

If you want to bring your changes back into the main repo, you can make a pull request to do so. Note that your code will be under strict requirements to make sure that things don't turn into spaghetti:

- Code must be fully typed Typescript (no `as any` or `//ts-ignore` unless absolutely necessary).
- If adding a similar feature to something that already exists, the code must follow a similar pattern and re-use as much existing code as possible (no DRY violations).
- Names of variables, methods, etc. must be consistent with those already in the project.
- There must be test cases that cover your changes/additions (see `src/test/`).
- The pull request must be git-rebase-able on the HEAD of the `develop` branch without conflict.
- Commit messages must follow the project conventions (below).

## Setting up your development environment

After forking this repo to your own GitHub account
and cloning locally:

- Open a terminal in the root of this project.
  - Run `npm install`
  - Run `npm run build`
  - Run `npm test`
- If all tests are passing, you're good to go!

## How to test your code

If you are using Visual Studio Code, you can open
up the debug panel from the sidebar and hit the play
button to run tests. Output will appear in your Debug
Console.

To compile the code into JavaScript, run
`npm run build`. Alternatively, you can run the Typescript
compiler in watch mode to re-compile the code every time
you save a change, using `npx tsc -w`.

## Commit conventions

All of your commits must follow the conventions below.
We recommend squashing your commits into one commit per
feature/bugfix, but that isn't required.

We follow the conventional-changelog Angular convention for commit messages,
namely formatting them as `<type>: <subject>` where `type` is one of:

- feat: A new feature
- fix: A bug fix
- refactor: A code change that neither fixes a bug nor adds a feature
- test: Adding missing or correcting existing tests
- docs: Documentation only changes
- perf: A code change that improves performance
- chore: Changes to the build process or auxiliary tools and libraries such as documentation generation
