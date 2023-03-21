/*
 * SPDX-License-Identifier: MIT
 * Copyright (C) 2023 Roland Csaszar
 *
 * Project:  vscode-ocaml-expect-inline
 * File:     list_tests.ts
 * Date:     28.Feb.2023
 *
 * ==============================================================================
 * Everything to add tests to the Test Explorer tree from the output of an
 * inline runner list of tests.
 */
import * as c from "./constants";
import * as h from "./extension_helpers";
import * as io from "./osInteraction";
import * as p from "./parsing";
import * as vscode from "vscode";

/**
 * Add all tests of all workspaces to the Test Explorer.
 * @param env The extension's environment.
 * @returns The list of `TestItems` that have been deleted from the Test
 * Explorer tree.
 */
export async function addTests(
    env: h.Env,
    roots: readonly vscode.WorkspaceFolder[]
) {
    env.outChannel.appendLine("Adding new tests ...");

    const promises = [];
    for (const root of roots) {
        env.outChannel.appendLine(`Processing workspace ${root.name}`);
        promises.push(addWorkspaceTests(env, root));
    }

    const toDeleteArray = await Promise.allSettled(promises);

    env.outChannel.appendLine("Finished adding new tests.");

    // eslint-disable-next-line arrow-body-style
    return toDeleteArray.flatMap((e) => {
        return e.status === "fulfilled" ? e.value : [];
    });
}

/**
 * Add all tests of a single workspace `root` to the Test Explorer.
 * @param env Everything needed to add these tests.
 * @param root The workspace to add the tests from.
 * @returns The list of `TestItems` that have been deleted from the Test
 * Explorer tree.
 */
// eslint-disable-next-line max-statements
async function addWorkspaceTests(env: h.Env, root: vscode.WorkspaceFolder) {
    await setOpamEnv(env, root);

    // eslint-disable-next-line @typescript-eslint/no-extra-parens
    if (!(await h.isDuneWorking(root, env))) {
        vscode.window.showErrorMessage(
            `Error: Dune command '${c.getCfgDunePath(
                env.config
            )}' is not working in ${
                root.name
            }.\nSee the 'Output' window view of 'Expect and Inline Tests' for details.`
        );
        return [];
    }

    const workspaceItem = getWorkspaceItem();
    env.controller.items.add(workspaceItem);
    const toDelete: vscode.TestItem[] = [];
    // eslint-disable-next-line @typescript-eslint/no-extra-parens
    toDelete.push(...(await addPPXTests(env, root, workspaceItem)));

    return toDelete;

    /**
     * Return the `TestItem` of the current workspace if it does exist or create
     * it.
     * @returns The `TestItem` of the current workspace if it does exist or
     * create it.
     */
    function getWorkspaceItem() {
        const item = env.controller.items.get(root.name);
        if (item) {
            return item;
        }

        return env.controller.createTestItem(
            root.name,
            c.workspaceLabel(root.name),
            root.uri
        );
    }
}

/**
 * Run `opam env`, parse its output and set the environment accordingly.
 * @param env The extension's environment.
 * @param root The working directory for `opam`.
 */
async function setOpamEnv(env: h.Env, root: vscode.WorkspaceFolder) {
    const opamEnv = await io.opamEnv(root);
    for (const oEnv of opamEnv) {
        process.env[oEnv.name] = oEnv.value;
        env.outChannel.appendLine(
            `Workspace ${root.name}: adding env: ${oEnv.name} ${oEnv.value}`
        );
    }
}

/**
 * Add all inline and expect PPX test of the workspace `root`.
 * @param env Everything needed to add these tests.
 * @param root The workspace to add the tests to and from.
 * @param workspaceItem The parent of the test tree in the Test Explorer view.
 * @returns The list of `TestItems` that have been deleted from the Test
 * Explorer tree.
 */
async function addPPXTests(
    env: h.Env,
    root: vscode.WorkspaceFolder,
    workspaceItem: vscode.TestItem
) {
    env.outChannel.appendLine(
        `Workspace ${root.name}: searching for inline test runners ...`
    );

    const inlineRunnerPaths = await io.findFilesRelative(root, c.runnerExeGlob);
    const justBuildPaths = sanitizeRunnerPaths(env, inlineRunnerPaths);
    if (!justBuildPaths.length) {
        env.outChannel.appendLine(
            `Workspace ${root.name}: no inline test runners found`
        );
    }
    for (const runner of justBuildPaths) {
        env.outChannel.appendLine(`Found inline runner ${runner}`);
    }

    return generateTestList(env, {
        runnerPaths: justBuildPaths,
        root,
        workspaceItem,
    });
}

/**
 * Remove all test runners to exclude and test runner executables in `.sandbox`.
 * @param env The extension's environment.
 * @param inlineRunnerPaths The list of inline test runner paths to check.
 * @returns The list of test runners without the ones to exclude.
 */
function sanitizeRunnerPaths(env: h.Env, inlineRunnerPaths: string[]) {
    const justBuildPaths: string[] = [];
    const excludePaths = c.getCfgExcludeRunners(env.config);

    // eslint-disable-next-line no-labels
    outer: for (const incPath of inlineRunnerPaths) {
        if (incPath.includes(c.sandboxDir)) {
            // eslint-disable-next-line no-continue
            continue;
        }
        for (const excPath of excludePaths) {
            if (incPath.endsWith(excPath)) {
                // eslint-disable-next-line no-labels, no-continue
                continue outer;
            }
        }

        justBuildPaths.push(incPath);
    }
    return justBuildPaths;
}

/**
 * Generate the tree of tests in the Test Explorer from the list of tests of the
 * test runners.
 * @param env The environment to generate the tree of tests.
 * @param data The data needed to generate the test tree.
 * @returns The list of `TestItems` that have been deleted from the Test
 * Explorer tree.
 */
// eslint-disable-next-line max-statements
async function generateTestList(
    env: h.Env,
    data: {
        runnerPaths: string[];
        root: vscode.WorkspaceFolder;
        workspaceItem: vscode.TestItem;
    }
) {
    const groups: { name: string; tests: p.TestType[] }[] = [];
    for (const rPath of data.runnerPaths) {
        env.outChannel.appendLine(`Starting runner ${rPath}`);
        // eslint-disable-next-line no-await-in-loop
        const out = await io.runRunnerListDune(
            data.root,
            c.getCfgDunePath(env.config),
            rPath
        );
        env.outChannel.appendLine(
            `Finished run: ${rPath}\nList of tests:\n${out.stdout}\nStderr: ${
                out.stderr
            }\nError: ${out.error ? out.error : ""}`
        );

        if (out.stdout) {
            groups.push(
                // eslint-disable-next-line @typescript-eslint/no-extra-parens, no-await-in-loop
                ...(await parseTestListOutput(env, {
                    root: data.root,
                    workspaceItem: data.workspaceItem,
                    listOutput: out.stdout,
                    rPath,
                }))
            );
        }
    }
    const toDelete = deleteNonExistingGroups(data.workspaceItem, groups);
    for (const del of toDelete) {
        env.outChannel.appendLine(`Deleting ${del.label} ID: ${del.id}`);
    }
    return toDelete;
}

/**
 * Parse the output of the test list and add the test items to the test tree.
 * @param env The environment needed to add the tests.
 * @param data The data needed to add the test item to the tree.
 * @returns The list of tests parsed from the output.
 */
// eslint-disable-next-line max-statements
async function parseTestListOutput(
    env: h.Env,
    data: {
        root: vscode.WorkspaceFolder;
        workspaceItem: vscode.TestItem;
        listOutput: string;
        rPath: string;
    }
) {
    const groups = p.parseTestList(data.listOutput);

    for (const group of groups) {
        // eslint-disable-next-line no-await-in-loop
        const sourcePath = await io.findSourceOfTest(data.root, group.name);
        const groupItem = getTestItem({
            controller: env.controller,
            parent: data.workspaceItem,
            id: group.name,
            label: group.name,
            uri: sourcePath,
        });
        for (const t of group.tests) {
            addTestItem(env, {
                t,
                sourcePath,
                groupItem,
                root: data.root,
                runnerPath: data.rPath,
            });
        }
    }
    return groups;
}

/**
 * Check the given list of groups if there are any nodes in the tree, that have
 * been deleted and delete these groups.
 * That is, the group is not in the list of groups but is a children of the
 * suite node.
 * @param workspaceItem The workspace node the test belong to.
 * @param groups The list of groups to check.
 * @returns The list of `TestItems` that have been deleted from the Test
 * Explorer tree.
 */
function deleteNonExistingGroups(
    workspaceItem: vscode.TestItem,
    groups: { name: string; tests: p.TestType[] }[]
) {
    const workspaceGroup: vscode.TestItem[] = [];
    workspaceItem.children.forEach((e) => workspaceGroup.push(e));
    const toDelete = workspaceGroup.filter(
        (e) => !groups.find((v) => v.name === e.id)
    );

    toDelete.forEach((e) => {
        e.children.forEach((ch) => {
            workspaceItem.children.delete(ch.id);
        });
        workspaceItem.children.delete(e.id);
    });

    return toDelete;
}

/**
 * Add or update a single test item to the Test Explorer tree.
 * @param env The environment needed to add the test.
 * @param data The data needed to add the test item to the tree.
 */
export function addTestItem(
    env: h.Env,
    data: {
        t: p.TestType;
        sourcePath: vscode.Uri;
        groupItem: vscode.TestItem;
        root: vscode.WorkspaceFolder;
        runnerPath: string;
    }
) {
    const testItem = getTestItem({
        controller: env.controller,
        parent: data.groupItem,
        label: data.t.name,
        id: `${data.t.line}`,
        uri: data.sourcePath,
        line: data.t.line,
        colStart: data.t.startCol,
        colEnd: data.t.endCol,
    });

    if (!env.testData.get(testItem)) {
        env.testData.set(testItem, {
            root: data.root,
            runner: data.runnerPath,
            library: p.getLibrary(data.runnerPath),
            file: data.sourcePath.path,
        });
    }
}

/**
 * Return the `TestItem` with id `data.id`.
 * If it does already exist, just update its name. If it does not yet exist,
 * create a new `TestItem` and return that.
 * @param data The needed data.
 * @returns The existing or created `TestItem`.
 */
function getTestItem(data: {
    controller: vscode.TestController;
    parent: vscode.TestItem;
    id: string;
    label: string;
    line?: number;
    colStart?: number;
    colEnd?: number;
    uri?: vscode.Uri;
}) {
    let item = data.parent.children.get(data.id);
    if (item) {
        item.label = data.label;
        item.range = h.toRange(
            data.line ? data.line - 1 : 0,
            data.colStart,
            data.colEnd
        );
        return item;
    }

    item = data.controller.createTestItem(data.id, data.label, data.uri);
    if (data.line) {
        item.range = h.toRange(
            data.line ? data.line - 1 : 0,
            data.colStart,
            data.colEnd
        );
    }

    data.parent.children.add(item);

    return item;
}

/**
 * Return a list of tests to run.
 *
 * Either all tests of the `controller` are run or only the ones specified in
 * `request`.
 * @param request The request which may hold a list of tests (`TestItem`s) to
 * run.
 * @param controller Holding all existing `TestItem`s.
 * @param toDelete The list of deleted `TestItems`, don't add these to the tests
 * to run.
 * @returns The list of tests to run.
 */
export function testList(
    request: vscode.TestRunRequest,
    controller: vscode.TestController,
    toDelete: vscode.TestItem[]
) {
    const tests: vscode.TestItem[] = [];

    if (request.include) {
        request.include.forEach((t) => tests.push(...testAndChilds(t)));
    } else {
        controller.items.forEach((t) => tests.push(...testAndChilds(t)));
    }

    return tests.filter((t) => !request.exclude?.includes(t));

    /**
     * Return a list of a test and its children, if it has any.
     * @param t The test to check for children.
     * @returns A list of a test and its children.
     */
    function testAndChilds(t: vscode.TestItem) {
        const testNChilds: vscode.TestItem[] = [];
        if (t.children?.size > 0) {
            t.children.forEach((el) => testNChilds.push(...testAndChilds(el)));
        } else if (!toDelete.find((e) => e === t)) {
            testNChilds.push(t);
        }

        return testNChilds;
    }
}
