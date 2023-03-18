# OCaml Expect and Inline Test Explorer for Visual Studio Code Changelog

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
