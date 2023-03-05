/*
 * SPDX-License-Identifier: MIT
 * Copyright (C) 2023 Roland Csaszar
 *
 * Project:  vscode-ocaml-expect-inline
 * File:     extension_helpers.ts
 * Date:     28.Feb.2023
 *
 * ==============================================================================
 * Helper functions to deal with the extension API.
 */

import * as io from "./osInteraction";
import * as vscode from "vscode";

/**
 * Object holding additional data about a `TestItem`.
 * The advantage of a `WeakMap` is the automatic garbage collection of garbage
 * collected key objects. No need to explicitly delete objects.
 */
export type TestData = WeakMap<
    vscode.TestItem,
    {
        runner: string;
        library: string;
        root: vscode.WorkspaceFolder;
        file: string;
    }
>;

/**
 * Object containing the extension's environment.
 */
export type Env = {
    config: vscode.WorkspaceConfiguration;
    controller: vscode.TestController;
    outChannel: vscode.OutputChannel;
    testData: TestData;
    run?: vscode.TestRun;
};

/**
 * Return the mapping of `f` on `children`.
 * @param children The `TestItemCollection` to map.
 * @param f The function to apply to each `TestItem`.
 * @returns The mapping of `f` on `children`.
 */
export function map<T>(
    children: vscode.TestItemCollection,
    // eslint-disable-next-line no-unused-vars
    f: (item: vscode.TestItem) => T
) {
    const result: T[] = [];
    children.forEach((item) => result.push(f(item)));
    return result;
}

/**
 * Filter `children` by predicate `f`.
 * @param children The `TestItemCollection` to filter.
 * @param f The predicate function to apply to each `TestItem`.
 * @returns A list of `TestItem`s that the predicate `f` returns `true` for.
 */
export function filter(
    children: vscode.TestItemCollection,
    // eslint-disable-next-line no-unused-vars
    f: (item: vscode.TestItem) => boolean
) {
    const result: vscode.TestItem[] = [];
    children.forEach((item) => {
        if (f(item)) {
            result.push(item);
        }
    });
    return result;
}

/**
 * Return a fold of `children` by `f`, using `init` as the initial value for
 * the accumulator.
 * @param children The `TestItemCollection` to fold.
 * @param f The function to use to fold. The first argument is the accumulator,
 * the second the current `TestItem` of `children`.
 * @param init The initial value to start the fold with.
 * @returns A fold of `children` by `f`, using `init` as the initial value for
 * the accumulator.
 */
export function reduce<T>(
    children: vscode.TestItemCollection,
    // eslint-disable-next-line no-unused-vars
    f: (acc: T, item: vscode.TestItem) => T,
    init: T
) {
    let result = init;
    children.forEach((item) => {
        result = f(result, item);
    });
    return result;
}

/**
 * Return the name of the test in the format `FILENAME line LINE_NUMBER`.
 * @param path The source file's path.
 * @param line The line number, starting from 1.
 * @returns The name of the test in the format `FILENAME Line LINE_NUMBER`.
 */
export function toTestName(path: string, line: number) {
    return `${path} Line ${line}`;
}

/**
 * Return the list of currently opened workspace folders, and an empty list `[]`
 *  if no workspace (that includes a folder) has been opened.
 * @returns The list ('or' an empty list `[]`) of currently opened workspace
 * folders.
 */
export function workspaceFolders() {
    return vscode.workspace.workspaceFolders || [];
}

/**
 * Return the root and relative path to a workspace root of `uri`.
 * @param uri The absolute path to make relative to `root`
 * @returns The relative path of `uri` in `path`, the root in `root`.
 */
export function toRelativePath(uri: vscode.Uri) {
    return {
        root: vscode.workspace.getWorkspaceFolder(uri),
        path: vscode.workspace.asRelativePath(uri, false),
    };
}

/**
 * Return a `Range` with the given `line`, start and end column and an optional
 * end line.
 * @param line The line the range is located in.
 * @param colStart The start column of the range.
 * @param colEnd The end column of the range.
 * @param endLine The end line of the range, if this is not set, the start line
 * `line` is used instead.
 * @returns A `Range` with the given `line`, `endline`, start and end column.
 */
// eslint-disable-next-line max-params
export function toRange(
    line: number | undefined,
    colStart: number | undefined,
    colEnd: number | undefined,
    endLine?: number
) {
    const startLine = line ? line : 0;
    return new vscode.Range(
        new vscode.Position(startLine, colStart ? colStart : 0),
        new vscode.Position(endLine ? endLine : startLine, colEnd ? colEnd : 0)
    );
}

/**
 * Return the list of workspaces the given tests belong to.
 * @param items The tests to check for their workspaces.
 * @returns A list of workspaces the tests belong to.
 */
export function testItemsToWorkspaces(items: readonly vscode.TestItem[]) {
    const wFolders = workspaceFolders();
    const workspaces = items
        .map(onlyWorkspaces)
        .sort((i, j) => i.id.localeCompare(j.id))
        .filter((v, idx, arr) => v.id !== arr.at(idx + 1)?.id)
        .map(
            (v) =>
                wFolders.find(
                    (w) => `${w.name}` === v.id
                ) as vscode.WorkspaceFolder
        );

    return workspaces;

    /**
     * Return the workspaces containing the tests.
     * @param i The `TestItem` to process.
     * @returns The workspaces containing the tests.
     */
    function onlyWorkspaces(i: vscode.TestItem) {
        if (i.parent?.parent?.parent) {
            return i.parent.parent.parent;
        } else if (i.parent?.parent) {
            return i.parent.parent;
        } else if (i.parent) {
            return i.parent;
        }
        return i;
    }
}

/**
 * Return `true`, if the dune command is working in directory `root`, `false`
 * else.
 * Diagnostic output is appended to `env.outChannel`.
 * @param root The directory to use as working directory for dune.
 * @param env The needed extension's environment, an `OutputChannel`.
 * @returns `true`, if the dune command is working in directory `root`, `false`
 * else.
 */
export async function isDuneWorking(
    root: vscode.WorkspaceFolder,
    env: { outChannel: vscode.OutputChannel }
) {
    const {
        stdout: duneStdout,
        stderr: duneStderr,
        error: duneError,
    } = await io.checkDune(root);
    if (duneError) {
        env.outChannel.appendLine(duneError);
        return false;
    } else if (duneStderr?.length) {
        env.outChannel.appendLine(duneStderr);
        return true;
    } else if (duneStdout?.length) {
        env.outChannel.appendLine(duneStdout);
        return true;
    }
    return false;
}
