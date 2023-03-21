/*
 * SPDX-License-Identifier: MIT
 * Copyright (C) 2023 Roland Csaszar
 *
 * Project:  vscode-ocaml-expect-inline
 * File:     run_tests.ts
 * Date:     28.Feb.2023
 *
 * ==============================================================================
 * Run the tests that are being requested by the user.
 */

import * as h from "./extension_helpers";
import * as io from "./osInteraction";
import * as p from "./parsing";
import * as t from "./list_tests";
import * as vscode from "vscode";
import { getCfgDunePath } from "./constants";

/**
 * Run or cancel running tests.
 *
 * This is called whenever the user wants to run or cancel tests.
 * @param env All needed objects are contained in this environment.
 * @param request The actual run request.
 * @param token The `CancellationToken`. Whether the user wants to cancel the
 * test runs.
 */
export async function runHandler(
    env: h.Env,
    request: vscode.TestRunRequest,
    token: vscode.CancellationToken
) {
    const toDelete: vscode.TestItem[] = [];
    const run = env.controller.createTestRun(request);
    const tests = t.testList(request, env.controller, toDelete);
    tests.forEach((ti) => run.started(ti));

    for (const test of tests) {
        if (!token.isCancellationRequested) {
            const passEnv = {
                config: env.config,
                controller: env.controller,
                outChannel: env.outChannel,
                run,
                testData: env.testData,
            };
            passEnv.run = run;
            // eslint-disable-next-line no-await-in-loop
            await runSingleTest(passEnv, test);
        }
    }
    run.end();
}

/**
 * Run a single test and set the test's state.
 * @param env The environment needed to run a test.
 * @param test The test to run.
 */
async function runSingleTest(env: h.Env, test: vscode.TestItem) {
    const ret = env.testData.get(test);
    env.outChannel.appendLine(
        `Running test "${test.parent ? test.parent.label : ""}   ${
            test.id
        }    ${test?.label}"`
    );
    if (ret) {
        const { root, runner, library, file } = ret;
        const startTime = Date.now();
        test.busy = true;
        const out = await io.runRunnerTestsDune({
            root,
            duneCmd: getCfgDunePath(env.config),
            runner,
            library,
            tests: [`${test.parent?.label}:${test.id}`],
        });

        await parseTestResult(env, { out, startTime, test, root, file });
        // eslint-disable-next-line require-atomic-updates
        test.busy = false;
        env.run?.appendOutput(
            `${out.stdout
                ?.concat(out.stderr ? out.stderr : "")
                ?.replace(/\n/gu, "\r\n")}`
        );
    }
}

/**
 * Parse a test and set the test state.
 * Including failure location in the source code.
 * @param env The environment needed for the parsing.
 * @param {any} data The data to parse and construct the test result.
 */
// eslint-disable-next-line max-statements, max-lines-per-function
async function parseTestResult(
    env: h.Env,
    data: {
        out: io.Output;
        startTime: number;
        test: vscode.TestItem;
        root: vscode.WorkspaceFolder;
        file: string;
    }
) {
    const output = data.out.stdout?.concat(
        data.out.stderr ? data.out.stderr : ""
    );
    env.outChannel.appendLine(
        `Test output:\n${output}${data.out.error ? data.out.error : ""}`
    );
    if (data.out.error) {
        const msg = data.out.stderr?.length
            ? data.out.stderr
            : (data.out.error as string);
        await setRunnerError(env, msg, data.test);
        return;
    }
    if (output) {
        if (p.isCompileError(output)) {
            const msg = data.out.stderr?.length ? data.out.stderr : output;
            await setRunnerError(env, msg, data.test);
            return;
        }
        if (p.noTestsFound(output)) {
            env.outChannel.appendLine(`No Tests found: ${data.test.id}`);
            const { parent } = data.test;
            if (parent) {
                env.run?.passed(data.test, Date.now() - data.startTime);
                parent.children.delete(data.test.id);
                if (parent.children.size === 0) {
                    const grandparent = parent.parent;
                    // eslint-disable-next-line max-depth
                    if (grandparent) {
                        grandparent?.children.delete(parent.id);
                    }
                }
            }
        }
        const [errList] = p.parseTestErrors(output);
        const errElem = errList?.tests.find(
            (e) => `${e.line}` === data.test.id
        );
        if (errElem) {
            await setTestError(env, data, errElem);
            return;
        }
    }
    env.run?.passed(data.test, Date.now() - data.startTime);
}

/**
 * Set the state of the test to 'failed'.
 * @param env The environment of the extension.
 * @param data The needed data.
 * @param errElem The test that produced the error.
 */
async function setTestError(
    env: h.Env,
    data: { out: io.Output; startTime: number; test: vscode.TestItem },
    errElem: p.TestType
) {
    const output = data.out.stdout?.concat(
        data.out.stderr ? data.out.stderr : ""
    );
    let message = await constructMessage({
        txt: output ? output : "",
        test: data.test,
        testData: env.testData,
        errElem,
    });
    env.run?.failed(data.test, message, Date.now() - data.startTime);
}

/**
 * The test produced an error, that means e.g. that the test could not be
 * compiled.
 * @param env The extension's environment.
 * @param msg The error message.
 * @param test The test that produced the error.
 */
function setRunnerError(env: h.Env, msg: string, test: vscode.TestItem) {
    const mess = new vscode.TestMessage(msg);
    const loc = new vscode.Location(
        test.uri ? test.uri : vscode.Uri.file(""),
        test.range ? test.range : h.toRange(0, 0, 0)
    );
    mess.location = loc;
    env.run?.errored(test, mess);
}

/**
 * Return a `TestMessage` object filled with the information of the failed
 * test.
 * @param data The needed data.
 * @returns A `TestMessage` object filled with the information of the failed
 * test.
 */
async function constructMessage(data: {
    txt: string;
    test: vscode.TestItem;
    testData: h.TestData;
    errElem: p.TestType;
}) {
    let message = new vscode.TestMessage(data.txt);

    message.location = new vscode.Location(
        data.test.uri ? data.test.uri : vscode.Uri.file(""),
        data.test.range ? data.test.range : h.toRange(0, 0, 0)
    );

    message.actualOutput = data.errElem.actual;
    message.expectedOutput = data.errElem.expected;
    return message;
}
