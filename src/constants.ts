/*
 * SPDX-License-Identifier: MIT
 * Copyright (C) 2023 Roland Csaszar
 *
 * Project:  vscode-ocaml-expect-inline
 * File:     constants.ts
 * Date:     28.Feb.2023
 *
 * ==============================================================================
 * All constants used somewhere in the extension.
 */

import * as vscode from "vscode";

/**
 * The version of VS Code to use for testing.
 */
export const vscodeVersion = "1.65.0";

/**
 * The `id` parameter of `createTestController`.
 * Shall be a globally unique ID.
 */
export const testControllerID = "expectppxTestController";

/**
 * The `label` parameter of `createTestController`.
 */
export const testControllerLabel = "Expect and Inline PPX Tests";

/**
 * The name of the VS Code output channel - that's the `OUTPUT` tab of the
 * panel.
 */
export const outputChannelName = "Expect and Inline Tests";

/**
 * The label of the `TestRunProfileKind.Run` test profile.
 */
export const runProfileLabel = "Run PPX test";

/**
 * The label of root of the inline test tree in the Test Explorer view.
 */
export const inlineTestsLabel = "Expect and Inline Tests";

/**
 * Glob to search for sources of tests.
 */
export const testSourceGlob = "**/*.ml";

/**
 * Regex string to prepend to an inline test name.
 */
export const inlineTestPrefix = "let%test\\s+";

/**
 * Regex string to prepend to an inline test name that returns unit.
 */
export const inlineUnitTestPrefix = "let%test_unit\\s+";

/**
 * Regex string to prepend to an expect test.
 */
export const expectTestPrefix = "let%expect_test\\s+";

/**
 ******************************************************************************
 *  Test runner constants.
 * The test runner's command line is like this:
 * `dune exec _build/default/lib/.LIBRARY_NAME.inline-tests/inline_test_runner_LIBRARY_NAME.exe -- inline-test-runner LIBRARY_NAME -verbose`
 */

/**
 * Path of the build sandbox directory to ignore when searching for executables.
 */
export const sandboxDir = "_build/.sandbox";

/**
 * The cmd to call `dune`.
 */
export const duneCmd = "dune";

/**
 * The name of dune configuration files in the test directories.
 */
export const duneFileName = "dune";

/**
 * The argument to get dune's version.
 * Used to check if dune is callable at all.
 */
export const duneVersionArg = "--version";

/**
 * The argument for dune to run an executable.
 * Used to execute the test runners.
 */
export const duneExecArg = "exec";

/**
 * The argument to pass to dune to run all known tests.
 */
export const duneAllTestArg = "runtest";

/**
 * The argument to dune to signal the end of dune's arguments and the begin of
 * the tst runner's arguments.
 */
export const duneEndArgs = "--";

/**
 * The argument to the inline test runner with which to set the library to test.
 */
export const runnerLibArg = "inline-test-runner";

/**
 * The argument for the test runner to run a single test or the given list of
 * tests.
 */
export const runnerTestArg = "-only-test";

/**
 * Options to pass to the inline test runner to get a list of all tests.
 */
export const runnerListOption = "-verbose";

/**
 * Glob pattern to find the inline runner executable.
 */
export const runnerExeGlob = "**/inline_test_runner_*.exe";

/**
 * The suffix for test runner executables.
 */
export const exeSuffix = ".exe";

/**
 ******************************************************************************
 *  Configuration constants.
 */

/**
 * The name of the configuration section of the extension.
 */
export const cfgSection = "expectppx";

/**
 * Do a test discovery on startup by running all tests?
 */
export const cfgDiscoverOnStartup = "discoverOnStartup";

/**
 * Default value for `cfgDiscoverOnStartup`.
 */
export const cfgDefaultDiscoverOnStartup = true;

/**
 * Return the configuration value for `discoverOnStartup`.
 *
 * @param config The configuration object to use.
 * @returns The configuration value for `discoverOnStartup`.
 */
export function getCfgDiscover(config: vscode.WorkspaceConfiguration) {
    const doDiscover = config.get<boolean>(cfgDiscoverOnStartup);
    if (doDiscover === undefined) {
        return cfgDefaultDiscoverOnStartup;
    }
    return doDiscover;
}
