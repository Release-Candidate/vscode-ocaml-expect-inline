/*
 * SPDX-License-Identifier: MIT
 * Copyright (C) 2023 Roland Csaszar
 *
 * Project:  vscode-ocaml-expect-inline
 * File:     extension.ts
 * Date:     28.Feb.2023
 *
 * ==============================================================================
 * The main extension file.
 * Implement VS Code's `Testing API`, see
 * https://code.visualstudio.com/api/extension-guides/testing.
 */

import * as c from "./constants";
import * as h from "./extension_helpers";
import * as p from "./parsing";
import * as rt from "./run_tests";
import * as t from "./list_tests";
import * as vscode from "vscode";

/**
 * Called when the extension is being activated.
 * That is, the registered `Activation Event` has happened. The
 * `Activation Events` are configured in `package.json`, in the
 * `activationEvents` field.
 *
 * @param _context The `vscode.ExtensionContext` to use.
 */
export async function activate(context: vscode.ExtensionContext) {
    const outChannel = vscode.window.createOutputChannel(c.outputChannelName);
    outChannel.appendLine("OCaml Expect and Inline Test Explorer starting.");

    /*
     * If no workspace exists (that includes an opened folder), we can't do
     * anything sensible anyway.
     */
    if (!vscode.workspace.workspaceFolders) {
        outChannel.appendLine("Not in a workspace/no folder opened. Exiting.");
        return;
    }
    await setupExtension(context, outChannel);
}

/**
 * Setup the extension and add the tests to the Text Explorer view.
 * Only add the tests if `discoverOnStartup` is set to `true`.
 * @param context The extension's context.
 * @param outChannel The channel to log to.
 */
async function setupExtension(
    context: vscode.ExtensionContext,
    outChannel: vscode.OutputChannel
) {
    const testData: h.TestData = new WeakMap();

    const config = vscode.workspace.getConfiguration(c.cfgSection);

    const controller = vscode.tests.createTestController(
        c.testControllerID,
        c.testControllerLabel
    );
    context.subscriptions.push(controller);

    const env = { config, controller, outChannel, testData };

    const runProfile = controller.createRunProfile(
        c.runProfileLabel,
        vscode.TestRunProfileKind.Run,
        (r, tok) => rt.runHandler(env, r, tok)
    );
    context.subscriptions.push(runProfile);

    if (c.getCfgDiscover(config)) {
        await t.addTests(env, h.workspaceFolders());
    }

    subscribeToChanges(env, context);
}

/**
 * Subscribe to changes of workspaces, documents, ...
 * @param env The extension's environment.
 * @param context The extension's context to use.
 */
function subscribeToChanges(env: h.Env, context: vscode.ExtensionContext) {
    // eslint-disable-next-line no-unused-vars
    env.controller.refreshHandler = async (_) => {
        t.addTests(env, h.workspaceFolders());
    };

    const disposable = vscode.workspace.onDidChangeWorkspaceFolders(
        async (e) => {
            if (c.getCfgDiscover(env.config)) {
                t.addTests(env, e.added);
            }
            e.removed.map((r) => env.controller.items.delete(r.name));
        }
    );
    context.subscriptions.push(disposable);

    const disposable2 = vscode.workspace.onDidOpenTextDocument((e) => {
        if (p.isOCamlFile(e.uri.path)) {
            const relPath = h.toRelativePath(e.uri);
            env.outChannel.appendLine(
                `on open: ${e.uri.path} workspace: ${relPath.root}`
            );
            const foundTests = p.parseTextForTests(e.getText());
            const sanitizedTests = foundTests.map(({ name, range }) => ({
                name:
                    name === "_"
                        ? h.toTestName(relPath.path, range.start.line + 1)
                        : name,
                range,
            }));
            sanitizedTests.forEach(({ name, range }) =>
                env.outChannel.appendLine(`${name} ${range.start.line + 1}`)
            );
        }
    });
    const disposable3 = vscode.workspace.onDidChangeTextDocument((e) => {
        if (p.isOCamlFile(e.document.uri.path)) {
            env.outChannel.appendLine(`on change: ${e.document.uri.path}`);
        }
    });
    context.subscriptions.push(disposable2);
    context.subscriptions.push(disposable3);
}
