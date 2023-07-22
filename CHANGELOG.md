# OCaml Expect and Inline Test Explorer for Visual Studio Code Changelog

## Version 0.7.2 (2023-07-22)

Version bump for the Open VSX registry only, a bug in the registry broke the publishing of updates.
See [https://github.com/EclipseFdn/open-vsx.org/issues/2000](https://github.com/EclipseFdn/open-vsx.org/issues/2000)

## Version 0.7.1 (2023-07-17)

### Bugfixes

- Make the package smaller by not including GIFs.

### Internal Changes

- Update dependencies to new versions and make Yarn compatible to version 3

## Version 0.7.0 (2023-03-27)

- If the dune lock can't be acquired for 30s, raise an error window and ask the user what to do.
- Update the documentation.

### Bugfixes

- Make `Cancel Test Run` stop Dune processes waiting for the lock too. See [Issue #9](https://github.com/Release-Candidate/vscode-ocaml-expect-inline/issues/9).

## Version 0.6.0 (2023-03-25)

- Show the expected and actual values of Expect tests in VS Codes' diff view. See [Issue #6](https://github.com/Release-Candidate/vscode-ocaml-expect-inline/issues/6).

## Version 0.5.0 (2023-03-21)

- No need to run all tests at startup or refresh. Use the `-list-test-names` argument of the inline test runners.
- Disable ANSI color escape sequences in output of test failures.
- Update the documentation.

### Internal Changes

- Remove ANSI escape sequences from test fixtures.
- Add yarn target for the Open VSX Registry.

## Version 0.4.0 (2023-03-20)

- New configuration values:
  - `expectppx.discoverInSources` - Whether to parse source files on open and save for tests and update the Test Explorer tree. Should be set to `true` if `expectppx.discoverOnStartup` is `false`.
  - `expectppx.dunePath` - Set an absolute path or a path relative to the project root of the Dune executable. Default: `dune` - use the one in the local Opam environment or in `PATH`. See [Issue #3](https://github.com/Release-Candidate/vscode-ocaml-expect-inline/issues/3).
  - `expectppx.excludeRunners` - A list of inline test runner names to be excluded from test discovery an startup or refresh, e.g. because they take too long to finish.
- Add a message window to ask for a reload if a configuration value has changed.
- Update the documentation.

### Bugfixes

- Fix bug when tests from other test runners are deleted on startup or refresh having more than one inline test runner. See [Issue #3](https://github.com/Release-Candidate/vscode-ocaml-expect-inline/issues/3).

## Version 0.3.0 (2023-03-18)

- Add error message window if `dune` does not work in a workspace.

## Bugfixes

- Use the current Opam environment to be able to use local executables like `dune`. See [#1](https://github.com/Release-Candidate/vscode-ocaml-expect-inline/issues/1)

### Internal Changes

- Add tests to check the parsing of `opam env`.

## Version 0.2.0 (2023-03-06)

- Remove unnecessary node 'Expect and Inline Tests' in the Test Explorer tree.
- Change the name of the test profile to 'Run Expect and Inline PPX tests'.
- Add documentation of 'Run Profiles'.
- Add GitHub Issue Template.

## Version 0.1.0 (2023-03-05)

Initial release
