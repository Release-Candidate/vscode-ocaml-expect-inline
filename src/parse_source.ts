/*
 * SPDX-License-Identifier: MIT
 * Copyright (C) 2023 Roland Csaszar
 *
 * Project:  vscode-ocaml-expect-inline
 * File:     parse_source.ts
 * Date:     04.Mar.2023
 *
 * ==============================================================================
 * Parse a single source file for test definitions.
 */

import * as c from "./constants";
import * as h from "./extension_helpers";
import * as io from "./osInteraction";
import * as p from "./parsing";
import * as t from "./list_tests";
import * as vscode from "vscode";

/**
 * Parse the given source file for tests and add them to the Test Explorer's
 * tree.
 * @param env The extension's environment.
 * @param source The source file to parse for tests.
 */
// eslint-disable-next-line max-lines-per-function, max-statements
export async function parseTextDocument(
    env: h.Env,
    source: vscode.TextDocument
) {
    const relPath = h.toRelativePath(source.uri) as {
        root: vscode.WorkspaceFolder;
        path: string;
    };
    const sanitizedTests = p
        .parseTextForTests(source.getText())
        .map(({ name, range }) => ({
            name:
                name === "_"
                    ? h.toTestName(relPath.path, range.start.line + 1)
                    : name,
            range,
        }));

    const parents = io.getListParentDirs(relPath.path);
    for (const parent of parents) {
        if (
            // eslint-disable-next-line no-await-in-loop
            await hasAddedTests(env, {
                relPath,
                parent,
                sanitizedTests,
                source,
            })
        ) {
            return;
        }
    }
}

/**
 * Return `true` if we have found a dune file containing a library definition
 * and the tests have been added to the Test Explorer's tree.
 * @param env The extension's environment.
 * @param data The needed data.
 * @returns `true` if we have found a dune file containing a library definition.
 * `false` else.
 */
async function hasAddedTests(
    env: h.Env,
    data: {
        relPath: { root: vscode.WorkspaceFolder; path: string };
        parent: string;
        sanitizedTests: {
            name: string;
            range: vscode.Range;
        }[];
        source: vscode.TextDocument;
    }
) {
    const duneFile = vscode.Uri.joinPath(
        data.relPath.root.uri,
        data.parent.concat("/" + c.duneFileName)
    );
    if (await io.existsIsFile(duneFile)) {
        const bytes = await vscode.workspace.fs.readFile(duneFile);
        const libName = p.parseDuneLib(bytes.toString());
        if (libName) {
            env.outChannel.appendLine(
                `Found library "${libName}" in dune file ${duneFile.path}`
            );
            await addTests(env, {
                relPath: data.relPath,
                parent: data.parent,
                sanitizedTests: data.sanitizedTests,
                source: data.source,
                libName,
            });
            return true;
        }
    }
    return false;
}

/**
 * Add all tests to the Test Explorer's tree.
 * @param env The extension's environment.
 * @param data The needed data.
 */
async function addTests(
    env: h.Env,
    data: {
        relPath: { root: vscode.WorkspaceFolder; path: string };
        parent: string;
        sanitizedTests: {
            name: string;
            range: vscode.Range;
        }[];
        source: vscode.TextDocument;
        libName: string;
    }
) {
    const { groupItem } = getOrCreateParents(env, data.relPath);
    // eslint-disable-next-line no-await-in-loop
    const out = await io.runDuneBuild(
        data.relPath.root,
        data.parent,
        data.libName
    );
    env.outChannel.appendLine(
        `Dune build output stdout: ${out.stdout} stderr: ${out.stderr} error: ${
            out.error ? out.error : ""
        }`
    );

    data.sanitizedTests.forEach((test) =>
        t.addTestItem(env, {
            t: {
                name: test.name,
                line: test.range.start.line + 1,
                startCol: test.range.start.character,
                endCol: test.range.end.character,
            },
            root: data.relPath.root,
            sourcePath: data.source.uri,
            groupItem,
            runnerPath: c.fullRunnerPath(data.parent, data.libName),
        })
    );
}

/**
 * Return the two top nodes of the Test Explorer tree:
 * `{ workspaceItem, groupItem }`.
 * If they do not exist, create them.
 * @param env The extension's environment.
 * @param relPath The relative path to the source file.
 * @returns The two top nodes of the Test Explorer tree:
 * `{ workspaceItem, groupItem }`.
 */
function getOrCreateParents(
    env: h.Env,
    relPath: { root: vscode.WorkspaceFolder; path: string }
) {
    const workspaceItem = getOrCreateItem(env, {
        items: env.controller.items,
        id: relPath.root.name,
        label: c.workspaceLabel(relPath.root.name),
        uri: relPath.root.uri,
        delete: false,
    });
    const groupItem = getOrCreateItem(env, {
        items: workspaceItem.children,
        id: relPath.path,
        label: relPath.path,
        uri: vscode.Uri.joinPath(relPath.root.uri, relPath.path),
        delete: true,
    });
    return { workspaceItem, groupItem };
}

/**
 * Either return an existing `TestItem` with the given data or create one and
 * add it to the Test Explorer.
 * If `data.delete` is set, an existing `TestItem` and all of its children are
 * being deleted and created.
 * @param env The extension's environment.
 * @param data The needed data.
 * @returns The created or existing `TestItem`.
 */
function getOrCreateItem(
    env: h.Env,
    data: {
        items: vscode.TestItemCollection;
        id: string;
        label: string;
        uri: vscode.Uri;
        delete: boolean;
    }
) {
    let testItem = data.items.get(data.id);
    if (!testItem) {
        testItem = env.controller.createTestItem(data.id, data.label, data.uri);
        data.items.add(testItem);
    } else if (data.delete) {
        testItem.children.forEach((i) => {
            env.outChannel.appendLine(
                `Deleting "${i.label}" Line: ${parseInt(i.id, 10) + 1}`
            );
            testItem?.children.delete(i.id);
        });
        data.items.delete(data.id);
        testItem = env.controller.createTestItem(data.id, data.label, data.uri);
        data.items.add(testItem);
    }

    return testItem;
}
