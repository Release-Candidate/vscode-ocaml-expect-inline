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
export const runProfileLabel = "Run Expect and Inline PPX tests";

/**
 * Return the visible name of the workspace.
 * In the format: `Workspace: ID`.
 * @param id The id of the workspace.
 * @returns The visible name of the workspace.
 */
export function workspaceLabel(id: string) {
    return `Workspace: ${id}`;
}

/**
 * Glob to search for sources of tests.
 */
export const testSourceGlob = "**/*.ml";

/**
 * Command to run Opam with.
 */
export const opamCmd = "opam";

/**
 * The arguments to pass to the opam command to get the current environment.
 */
export const opamEnvArg = ["env"];

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
 * The root path of the dune build directory, `./_build/default`.
 */
export const buildDirRoot = "_build/default";

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
 * The argument for dune to build a file.
 * Used to build a test runner.
 */
export const duneBuildArg = "build";

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
 * Option to pass to the inline test runner to get a list of all tests.
 */
export const runnerListOption = "-list-test-names";

/**
 * Option to pass to the inline test runner to get a list of all test which are
 * being run, not just the failed ones.
 */
export const runnerVerboseOption = "-verbose";

/**
 * Option to pass to the inline test runner to get colorless output.
 */
export const runnerNoColorOption = "-no-color";

/**
 * Glob pattern to find the inline runner executable.
 */
export const runnerExeGlob = "**/inline_test_runner_*.exe";

/**
 * The suffix for test runner executables.
 */
export const exeSuffix = ".exe";

/**
 * Return the relative path to the test runner of the given library.
 * @param libDir The relative path to the libraries sources.
 * @param libName The name of the library the test runner is build for.
 * @returns The relative path of the test runner.
 */
export function fullRunnerPath(libDir: string, libName: string) {
    return buildDirRoot.concat(
        "/" +
            libDir +
            "/." +
            libName +
            ".inline-tests/inline_test_runner_" +
            libName +
            exeSuffix
    );
}

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
 * Do parse source files for tests on save or open.
 */
export const cfgDiscoverInSources = "discoverInSources";

/**
 * The default value of `cfgDiscoverInSources`.
 */
export const cfgDefaultDiscoverInSources = false;

/**
 * The path of the Dune Executable.
 */
export const cfgDunePath = "dunePath";

/**
 * The default value for the Dune path.
 */
export const cfgDefaultDunePath = duneCmd;

/**
 * A list of inline test runners to exclude from adding to the Test Explorer on
 * startup or refresh.
 */
export const cfgExcludeRunners = "excludeRunners";

/**
 * The default value of 'excludeRunners'.
 */
export const cfgDefaultExcludeRunners: string[] = [];

/**
 * Return the configuration value for `discoverOnStartup`.
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

/**
 * Return the configuration value for `discoverOnStartup`.
 * @param config The configuration object to use.
 * @returns The configuration value for `discoverOnStartup`.
 */
export function getCfgDiscoverInSources(config: vscode.WorkspaceConfiguration) {
    const doDiscover = config.get<boolean>(cfgDiscoverInSources);
    if (doDiscover === undefined) {
        return cfgDefaultDiscoverInSources;
    }
    return doDiscover;
}

/**
 * Return the configuration value for `dunePath`.
 * @param config The configuration object to use.
 * @returns The configuration value for `dunePath`.
 */
export function getCfgDunePath(config: vscode.WorkspaceConfiguration) {
    const dunePath = config.get<string>(cfgDunePath);
    if (dunePath === undefined) {
        return cfgDefaultDunePath;
    }
    return dunePath;
}

/**
 * Return the configuration value for `excludeRunners`.
 * @param config The configuration object to use.
 * @returns The configuration value for `excludeRunners`.
 */
export function getCfgExcludeRunners(config: vscode.WorkspaceConfiguration) {
    const excludeRunners = config.get<string[]>(cfgExcludeRunners);
    if (excludeRunners === undefined) {
        return cfgDefaultExcludeRunners;
    }
    return excludeRunners;
}
