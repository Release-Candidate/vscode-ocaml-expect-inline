> [!WARNING]
> As I use neither OCaml nor VS Code any more I will not add any new features to this extension.
> Feel free to fork it for yourself.
> I would also change the owner if you would like to be the official maintainer of this extension.

# OCaml Expect and Inline Test Explorer for Visual Studio Code

[![Test](https://github.com/Release-Candidate/vscode-ocaml-expect-inline/actions/workflows/test.yml/badge.svg)](https://github.com/Release-Candidate/vscode-ocaml-expect-inline/actions/workflows/test.yml)
[![Lint](https://github.com/Release-Candidate/vscode-ocaml-expect-inline/actions/workflows/lint.yml/badge.svg)](https://github.com/Release-Candidate/vscode-ocaml-expect-inline/actions/workflows/lint.yml)
[![Release](https://github.com/Release-Candidate/vscode-ocaml-expect-inline/actions/workflows/release.yml/badge.svg)](https://github.com/Release-Candidate/vscode-ocaml-expect-inline/actions/workflows/release.yml)
[![Visual Studio Marketplace Downloads](https://img.shields.io/visual-studio-marketplace/d/Release-Candidate.vscode-ocaml-expect-inline)](https://marketplace.visualstudio.com/items?itemName=release-candidate.vscode-ocaml-expect-inline)
[![Visual Studio Marketplace Installs](https://img.shields.io/visual-studio-marketplace/i/Release-Candidate.vscode-ocaml-expect-inline)](https://marketplace.visualstudio.com/items?itemName=release-candidate.vscode-ocaml-expect-inline)
[![Visual Studio Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/Release-Candidate.vscode-ocaml-expect-inline)](https://marketplace.visualstudio.com/items?itemName=release-candidate.vscode-ocaml-expect-inline)
[![Open VSX Version](https://img.shields.io/open-vsx/v/Release-Candidate/vscode-ocaml-expect-inline)](https://open-vsx.org/extension/Release-Candidate/vscode-ocaml-expect-inline)

![Expect and Inline logo](./images/inline_ppx_banner.png)

This extension lets you run OCaml [PPX Expect](https://github.com/janestreet/ppx_expect) and [PPX Inline Test](https://github.com/janestreet/ppx_inline_test) with the (native) Test Explorer UI.

![Animation of a test run](https://raw.githubusercontent.com/Release-Candidate/vscode-ocaml-expect-inline/main/images/run_tests.gif)
![Animation of adding a test](https://raw.githubusercontent.com/Release-Candidate/vscode-ocaml-expect-inline/main/images/add_test.gif)

- [Features and drawbacks](#features-and-drawbacks)
  - [Drawbacks](#drawbacks)
- [Getting started](#getting-started)
  - [Dependencies](#dependencies)
  - [Installation](#installation)
  - [Q \& A](#q--a)
    - [Q: What do the groups in the Test Explorer view mean?](#q-what-do-the-groups-in-the-test-explorer-view-mean)
    - [Q: How can I (re-) discover all tests?](#q-how-can-i-re--discover-all-tests)
    - [Q: Where can I see the output of the test run(s)?](#q-where-can-i-see-the-output-of-the-test-runs)
    - [Q: How can I change which test extension's tests are run by the `Run Tests` button in the upper right of the Test Explorer?](#q-how-can-i-change-which-test-extensions-tests-are-run-by-the-run-tests-button-in-the-upper-right-of-the-test-explorer)
    - [Q: What does the red circle with a dot in the middle mean?](#q-what-does-the-red-circle-with-a-dot-in-the-middle-mean)
    - [Q: Where can I see the log of the extension?](#q-where-can-i-see-the-log-of-the-extension)
    - [Q: Why does the extension not work when using Dune in watch-mode `dune -w | --watch` or `dune ... --passive-watch`?](#q-why-does-the-extension-not-work-when-using-dune-in-watch-mode-dune--w----watch-or-dune----passive-watch)
- [Configuration](#configuration)
- [Changes](#changes)
- [Contributing](#contributing)
- [License](#license)

## Features and drawbacks

- uses dune to compile and run the tests
- support for expect PPX tests and inline PPX tests
- filtering of tests by name
- parses the test list output of the test runners to fill the Test Explorer view: faster than grepping every source file for test cases and the test tree view is consistent with the test runners
- retries running dune if another instance has locked the project until dune can acquire the lock or a timeout occurred
- Uses VS Code's native Test Explorer (no additional extension needed)

### Drawbacks

- needs dune
- when running tests, every test is run on its own, sequentially
- Uses VS Code's native Test Explorer UI

## Getting started

### Dependencies

- Visual Studio Code version 1.65 (February 2022) or higher
- [PPX Expect](https://github.com/janestreet/ppx_expect) or [PPX Inline Test](https://github.com/janestreet/ppx_inline_test)
- [Dune](https://dune.build/): the extension uses Dune to build and run the test runners.

**Attention:** you must be in a trusted workspace. Tests (test runners) can execute arbitrary code, so you do **not** want to run them in untrusted directories!

### Installation

Either

- install the extension directly from the Visual Studio Code Marketplace [Expect and Inline Tests](https://marketplace.visualstudio.com/items?itemName=release-candidate.vscode-ocaml-expect-inline)
- install the extension directly from the Open VSX Registry [Expect and Inline Tests](https://open-vsx.org/extension/Release-Candidate/vscode-ocaml-expect-inline)
- or download the extension from the [latest release at GitHub](https://github.com/Release-Candidate/vscode-ocaml-expect-inline/releases/latest)
- or build the extension yourself by cloning the [GitHub Repository](https://github.com/Release-Candidate/vscode-ocaml-expect-inline) and running `yarn install` and `yarn package` in the root directory of the cloned repo.

### Q & A

[What do the groups in the Test Explorer view mean?](#q-what-do-the-groups-in-the-test-explorer-view-mean)

[How can I (re-) discover all tests?](#q-how-can-i-re--discover-all-tests)

[Where can I see the output of the test run(s)?](#q-where-can-i-see-the-output-of-the-test-runs)

[How can I change which test extension's tests are run by the `Run Tests` button in the upper right of the Test Explorer?](#q-how-can-i-change-which-test-extensions-tests-are-run-by-the-run-tests-button-in-the-upper-right-of-the-test-explorer)

[What does the red circle with a dot in the middle mean?](#q-what-does-the-red-circle-with-a-dot-in-the-middle-mean)

[Where can I see the log of the extension?](#q-where-can-i-see-the-log-of-the-extension)

[Q: Why does the extension not work when using Dune in watch-mode `dune -w | --watch` or `dune ... --passive-watch`?](#q-why-does-the-extension-not-work-when-using-dune-in-watch-mode-dune--w----watch-or-dune----passive-watch)

#### Q: What do the groups in the Test Explorer view mean?

![The Test Explorer's tree view](https://raw.githubusercontent.com/Release-Candidate/vscode-ocaml-expect-inline/main/images/treeview.png)

A: Every workspace folder in the current project has it's own node, `Workspace: WORKSPACE_NAME`. If the project is a single workspace, only one of these exists. Below the workspace node the test cases are grouped by filename. If you are using another Test Explorer extension, like [Alocotest Test Explorer](https://marketplace.visualstudio.com/items?itemName=release-candidate.vscode-ocaml-alcotest-test-adapter), the workspace nodes are contained in a root node of each testing extension - `Expect and Inline PPX Tests` (Alcotest tests in `Alcotest Tests`)

#### Q: How can I (re-) discover all tests?

![Animation of the Refresh Tests button](https://raw.githubusercontent.com/Release-Candidate/vscode-ocaml-expect-inline/main/images/refresh_tests.gif)

A: Push the Refresh Tests button in the upper right of the Test Explorer view.

#### Q: Where can I see the output of the test run(s)?

A: You can either click the `Show Output` button in the upper right corner of the Test Explorer to see the output in a new terminal window,
![Show test output in terminal](https://raw.githubusercontent.com/Release-Candidate/vscode-ocaml-expect-inline/main/images/test_output_terminal.png)
click on `Go To Test` to the right of a failed test in the test explorer and then `Peek Error` or `Peek Test Output`
![Peek Error or Peek Test Output](https://raw.githubusercontent.com/Release-Candidate/vscode-ocaml-expect-inline/main/images/peek_error.png)
or hover over the [Error Lens](https://marketplace.visualstudio.com/items?itemName=usernamehw.errorlens) output in the source file - this preview is too narrow, so the test output is mangled.
![Hover over the Error Lens text](https://raw.githubusercontent.com/Release-Candidate/vscode-ocaml-expect-inline/main/images/hover_error_lens.png)

#### Q: How can I change which test extension's tests are run by the `Run Tests` button in the upper right of the Test Explorer?

![Set default run profiles](https://raw.githubusercontent.com/Release-Candidate/vscode-ocaml-expect-inline/main/images/run_profiles.png)

A: Click the down arrow to the right of the `Run Tests` button, there you can set the profiles using `Select Default Profile(s)`.

#### Q: What does the red circle with a dot in the middle mean?

![Compile error](https://raw.githubusercontent.com/Release-Candidate/vscode-ocaml-expect-inline/main/images/compile_error.png)
A: That means that dune returned an error (not a failed test). Mostly because of code that does not compile.

#### Q: Where can I see the log of the extension?

![Output tab of Expect Extension](https://raw.githubusercontent.com/Release-Candidate/vscode-ocaml-expect-inline/main/images/output.png)

A: In the `OUTPUT` tab of the Panel, you have to select the extension named `Expect and Inline Tests` in the upper right drop-down menu.

#### Q: Why does the extension not work when using Dune in watch-mode `dune -w | --watch` or `dune ... --passive-watch`?

![Lock error window](https://raw.githubusercontent.com/Release-Candidate/vscode-ocaml-expect-inline/main/images/lock_error.png)

A: Dune uses a file lock (default path: `_build/.lock`) to coordinate multiple Dune processes. Dune in watch mode does not release the file lock at all, so no other Dune process can run at the same time.
The meaning of the two buttons in the error message is:

- `Cancel` - stop the running Dune process: cancels running Dune, but the extension is **not** going to work until the other Dune process releases the lock.
- `Retry` - retry running Dune: Either stop the Dune process in watch mode or wait until all other Dune processes have finished their work. If no other Dune process is running, click `Retry`.

For a future version of Dune the plan is to be able to use the Dune process in watch mode with another dune running e.g. `dune [rpc] exec` and get the output on the 'client' Dune process.

## Configuration

- `expectppx.dunePath` - Set an absolute path or a path relative to the project root of the Dune executable. Default: `dune` - use the one in the local Opam environment or in `PATH`.
- `expectppx.excludeRunners` - A list of inline test runner names to be excluded from test discovery an startup or refresh, e.g. because they take too long to finish. E.g. `["inline_test_runner_fsevents_tests.exe"]` to exclude the test runner of the `fsevents_tests` library.
- `expectppx.discoverOnStartup` - Boolean. Set this to `false` if you do not want to run or compile all expect and inline test runners on startup to discover tests. If you want to rediscover all test by running all inline test runners, use the `Refresh Tests` button in the upper right corner of the Test Explorer.
- `expectppx.discoverInSources` - Boolean. Whether to parse source files on open and save for tests and update the Test Explorer tree. Should be set to `true` if `expectppx.discoverOnStartup` is `false`.

## Changes

See file [CHANGELOG.md](CHANGELOG.md).

## Contributing

See file [CONTRIBUTING.md](CONTRIBUTING.md)

## License

OCaml Expect and Inline Test Explorer for Visual Studio Code is licensed under MIT license. See file [LICENSE](LICENSE)
