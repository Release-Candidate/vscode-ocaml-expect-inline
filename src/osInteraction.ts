/*
 * SPDX-License-Identifier: MIT
 * Copyright (C) 2023 Roland Csaszar
 *
 * Project:  vscode-ocaml-expect-inline
 * File:     osInteraction.ts
 * Date:     28.Feb.2023
 *
 * ==============================================================================
 * File system access, reading files, calling executables and other interactions
 * with the OS. I/O.
 */

/* eslint-disable camelcase */

import * as c from "./constants";
import * as child_process from "child_process";
import internal = require("stream");
import * as parse from "./parsing";
import * as vscode from "vscode";
import path = require("path");

/**
 * Object holding the output of a process.
 *
 * Only two possible `Output`s exist: either
 * `{ stdout: string; stderr: string }` or `{ error: string }`.
 *
 *  - If an error occurred while executing the command, the field `error` is set to
 * the message. Normally that means, that the command has not been found.
 * `stdout` and `stderr` are both `undefined`.
 * - If the command returned an error, the error message is returned in the
 * field `stderr`, the output (if any) of stdout is in the string `stdout` and
 * `error` is `undefined`.
 * - If the command finished successfully, the output is returned in the field
 * `stdout`, the field `stderr` should be the empty string `""` and `error` is
 * `undefined`.
 */
export type Output = {
    stdout?: string;
    stderr?: string;
    error?: string;
};

/**
 * Return a list of all relative parent directories of the given relative path.
 * The first directory in the list is `dirname(relPath)`, the last one is always
 * `.`, the root of the relative path.
 * @param relPath The relative path to process.
 * @returns A list of all relative parent directories of the given relative path.
 */
export function getListParentDirs(relPath: string) {
    return addParent(relPath, []);

    /**
     * Add the parent of `dir` to the list `list` and return it.
     * @param dir The directory which's parent should be added to the list.
     * @param list The list to add the parent of `dir` to.
     * @returns `list` with the parent of `dir` added to it.
     */
    function addParent(dir: string, list: string[]) {
        if (dir !== ".") {
            const parent = path.dirname(dir);
            list.push(parent);
            addParent(parent, list);
        }
        return list;
    }
}

/**
 * Check which of the given relative directories exist and are directories.
 * Return a list of directories, so that for all of the returned directories
 * path holds: `root`/path exists and path is in `dirs`.
 * @param root The directory to append the relative directories to test to.
 * @param dirs The relative directory paths to check for existence.
 * @returns A list of relative paths of the directories of `dirs` that exist.
 */
export async function filterExistingDirs(
    root: vscode.WorkspaceFolder,
    dirs: string[]
) {
    const promises = [];
    for (let dir of dirs) {
        const pathUri = vscode.Uri.joinPath(root.uri, dir);
        promises.push(vscode.workspace.fs.stat(pathUri));
    }
    const stats = await Promise.allSettled(promises);

    const statsAndPaths: [PromiseSettledResult<vscode.FileStat>, string][] =
        stats.map((e, idx) => [e, dirs[idx]]);

    /**
     * Return `true` if `f` is a directory or link.
     * @param f The file type to check.
     * @returns `true` if `f` is a directory or link.
     */
    function filterDirs(f: PromiseSettledResult<vscode.FileStat>) {
        return (
            f.status === "fulfilled" &&
            (f.value.type === vscode.FileType.Directory ||
                f.value.type === vscode.FileType.SymbolicLink)
        );
    }

    // eslint-disable-next-line no-unused-vars
    return statsAndPaths.filter(([f]) => filterDirs(f)).map(([_, d]) => d);
}

/**
 * Return `true` if the given path 'is' a file or symbolic link.
 * Return `false` else.
 * @param uri The `Uri` of the file to check.
 * @returns `true` if the given path 'is' a file or symbolic link. `false` else.
 */
export async function existsIsFile(uri: vscode.Uri) {
    try {
        const stat = await vscode.workspace.fs.stat(uri);
        return (
            stat.type === vscode.FileType.File ||
            stat.type === vscode.FileType.SymbolicLink
        );
    } catch (error) {
        return false;
    }
}

/**
 * Search for files containing the tests from group `groupname`.
 * @param root The workspace root directory to use to search for source files.
 * @param filename The filename of the file containing the
 * @returns The `Uri` of the sources to test group `groupname` on success or the
 * empty URI `""` if no source file could be found.
 */
export async function findSourceOfTest(
    root: vscode.WorkspaceFolder,
    filename: string
) {
    const possibleInline = await findInlineSources(root, filename);
    if (possibleInline) {
        return possibleInline;
    }

    return vscode.Uri.file("");
}

/**
 * Search for file with filename `fileName` in directory `root`.
 * Return `undefined` if no such file has been found.
 * @param root The root of the workspace to search in.
 * @param fileName The filename of the source file containing the inline tests.
 * @returns The `Uri` of the found file on success, `undefined` else.
 */
async function findInlineSources(
    root: vscode.WorkspaceFolder,
    fileName: string
) {
    const option1 = await findFilesRelative(root, fileName);
    if (option1.length > 0) {
        return vscode.Uri.joinPath(root.uri, option1[0]);
    }

    // eslint-disable-next-line no-undefined
    return undefined;
}

/**
 * Return a list of files matching the pattern `glob` in the directory `root`.
 * If no file matching the pattern has been found or an error occurred, the
 * empty list `[]` is returned.
 * @param root The path of the directory to search in.
 * @param glob The glob pattern to match against the absolute path of a file.
 * @returns A list of files matching the pattern `glob` in the directory `root`.
 */
export async function findFilesRelative(
    root: vscode.WorkspaceFolder,
    glob: string
) {
    try {
        const pattern = new vscode.RelativePattern(root, glob);
        const uris = await vscode.workspace.findFiles(pattern);
        return uris.map((u) => vscode.workspace.asRelativePath(u, false));
    } catch (error) {
        return [];
    }
}

/**
 * Return the relative path of `append` appended to `dir`.
 * @param dir The directory to append to.
 * @param append The path to append to `dir`.
 * @returns The relative path of `append` appended to `dir`.
 */
export function concatRelativePaths(dir: string, append: string) {
    return path.normalize(dir.concat("/" + append));
}

/**
 * Spawn the given command with the given arguments and return the output.
 * Set `root` as the working directory of the command.
 * `{ stdout; stderr; error }` is returned, see {@link Output}.
 * @param root The current working directory for the command.
 * @param cmd The command to call.
 * @param args The arguments to pass to the command.
 * @returns An object containing the output of the command's execution.
 */
export async function runCommand(
    root: vscode.WorkspaceFolder,
    cmd: string,
    args: string[]
): Promise<Output> {
    const proc = child_process.spawn(cmd, args, {
        cwd: root.uri.path,
        env: process.env,
    });

    const checkCmd = new Promise((_, reject) => {
        proc.on("error", reject);
    });

    const out = await readStream(proc.stdout);
    const err = await readStream(proc.stderr);

    const exitCode = new Promise<number>((resolve) => {
        proc.on("close", resolve);
    });

    try {
        await Promise.race([checkCmd, exitCode]);
        return { stdout: out, stderr: err };
    } catch (error) {
        return { error: (error as Error).message };
    }
}

/**
 * Run `opam env` and parse its output.
 * Return the environment variables as a list.
 * @param root The current working directory to use for `opam`.
 * @returns A list of environment variables `[{ name, value}]`
 */
export async function opamEnv(root: vscode.WorkspaceFolder) {
    const output = await runCommand(root, c.opamCmd, c.opamEnvArg);

    return parse.parseOpamEnv(output.stdout ? output.stdout : "");
}

/**
 * This is a wrapper around `runCommand`, to retry running dune if another dune
 * process holds the lock file.
 * @param data.token Either an `CancellationToken` if this run can be cancelled or
 * `undefined`, if this run cannot the cancelled.
 * @param data.root The current working directory to use for dune.
 * @param data.sleepTime The time to sleep in seconds between each successive try of
 * @param cmd Command and arguments to call dune with.
 * acquiring the dune lock.
 * @returns The output of the dune command.
 */
// eslint-disable-next-line max-statements
async function runDuneCommand(
    data: {
        token: vscode.CancellationToken | undefined;
        root: vscode.WorkspaceFolder;
        sleepTime: number;
    },
    cmd: { duneCmd: string; args: string[] },
    loopNum?: number
): Promise<Output> {
    if (data.token?.isCancellationRequested) {
        return { stderr: undefined, stdout: "" };
    }
    // eslint-disable-next-line no-magic-numbers
    if (loopNum && loopNum > 10) {
        const answer = await vscode.window.showErrorMessage(
            `Error. Could not acquire Dune lock. Another Dune process is holding the directory lock!`,
            "Cancel",
            "Retry"
        );
        if (answer === "Cancel") {
            return { error: "Error: Dune lock could not be acquired!" };
        } else {
            return runDuneCommand(data, cmd);
        }
    }
    const out = await runCommand(data.root, cmd.duneCmd, cmd.args);
    if (out.stderr) {
        if (parse.isDuneLocked(out.stderr)) {
            // eslint-disable-next-line no-magic-numbers
            await sleep(data.sleepTime * 1000);
            return runDuneCommand(data, cmd, loopNum ? loopNum + 1 : 1);
        }
    }

    /**
     * Sleep for `time` milliseconds.
     * @param time The time in ms until this promise resolves.
     */
    function sleep(time: number) {
        return new Promise<void>((resolve) => {
            setTimeout(resolve, time);
        });
    }

    return out;
}

/**
 * Build the test runner for the library `libName` which sources are contained
 * in `libDir`.
 * @param token Either an `CancellationToken` if this run can be cancelled or
 * `undefined`, if this run cannot the cancelled.
 * @param root The current working directory for the dune command.
 * @param cmd.duneCmd The command to call dune with.
 * @param cmd.libDir The relative path (from `root`) to the library's sources.
 * @param cmd.libName The name of the library the test runner is build for.
 * @returns The output of the build.
 */
export async function runDuneBuild(
    token: vscode.CancellationToken | undefined,
    root: vscode.WorkspaceFolder,
    cmd: {
        duneCmd: string;
        libDir: string;
        libName: string;
    }
) {
    return runDuneCommand(
        {
            token,
            root,
            // eslint-disable-next-line no-magic-numbers
            sleepTime: 3,
        },
        {
            args: [
                c.duneBuildArg,
                path.normalize(c.fullRunnerPath(cmd.libDir, cmd.libName)),
            ],
            duneCmd: cmd.duneCmd,
        }
    );
}

/**
 * Run the given runner executable with command line arguments to list all tests
 * using dune and return its output.
 * Set `root` as the working directory of the command.
 * The test list output is contained in `stdout`, `stderr` should be the empty
 * string und `error` should be `undefined`. See {@link Output}
 * @param data.token Either an `CancellationToken` if this run can be cancelled
 * or `undefined`, if this run cannot the cancelled.
 * @param data.root The current working directory for the dune command.
 * @param data.duneCmd The command to call dune with.
 * @param data.runner The path to the runner to execute.
 * @returns The output of the test runner in the `stdout` field.
 */
export async function runRunnerListDune(data: {
    token: vscode.CancellationToken | undefined;
    root: vscode.WorkspaceFolder;
    duneCmd: string;
    runner: string;
}) {
    return runDuneCommand(
        {
            token: data.token,
            root: data.root,
            // eslint-disable-next-line no-magic-numbers
            sleepTime: 3,
        },
        {
            duneCmd: data.duneCmd,
            args: [
                c.duneExecArg,
                data.runner,
                c.duneEndArgs,
                c.runnerLibArg,
                parse.getLibrary(data.runner),
                c.runnerListOption,
                c.runnerNoColorOption,
            ],
        }
    );
}

/**
 * Run the given runner executable command line arguments to run all given tests
 * using dune and return its output.
 * Set `root` as the working directory of the command.
 * `{ stdout; stderr; error }` is returned, see {@link Output}.
 * @param data The command line data needed to run tests.
 * @returns The output of the test runner.
 */
export async function runRunnerTestsDune(data: {
    token: vscode.CancellationToken | undefined;
    root: vscode.WorkspaceFolder;
    duneCmd: string;
    runner: string;
    library: string;
    tests: string[];
}) {
    return runDuneCommand(
        {
            root: data.root,
            token: data.token,
            // eslint-disable-next-line no-magic-numbers
            sleepTime: 3,
        },
        {
            duneCmd: data.duneCmd,
            args: [
                c.duneExecArg,
                data.runner,
                c.duneEndArgs,
                c.runnerLibArg,
                data.library,
                c.runnerVerboseOption,
                c.runnerNoColorOption,
                c.runnerTestArg,
                ...data.tests,
            ],
        }
    );
}

/**
 * Run all known tests using `dune runtest` and return its output.
 * @param token Either an `CancellationToken` if this run can be cancelled or
 * `undefined`, if this run cannot the cancelled.
 * @param root The current working directory for the dune command.
 * @param duneCmd The command to call dune with.
 * @returns The output of `dune test` called in the directory `root`.
 */
export async function runDuneTests(
    token: vscode.CancellationToken | undefined,
    root: vscode.WorkspaceFolder,
    duneCmd: string
) {
    return runDuneCommand(
        {
            token,
            root,
            // eslint-disable-next-line no-magic-numbers
            sleepTime: 3,
        },
        { duneCmd, args: [c.duneAllTestArg] }
    );
}

/**
 * Check, if dune is working, that is `dune --version` returns a version.
 * A message suitable to be logged is returned in `error`, `stderr` or
 * `stdout`.
 *
 * If the dune command has not been found or is not working at all, an error
 * message is returned in `error`.
 * If the dune command works, but the `--version` argument printed something at
 * stderr, `stderr` is set to a warning message, but I guess dune is working and
 * can be used.
 * If 'dune --version' returned a version string that could not be parsed,
 * `stderr` is set to a message, but I guess dune is working and
 * can be used.
 * If 'dune --version' could be parsed, a message is returned in the field
 * `stdout`.
 * @param token Either an `CancellationToken` if this run can be cancelled or
 * `undefined`, if this run cannot the cancelled.
 * @param root The working directory for dune to use.
 * @param duneCmd The command to call dune with.
 * @returns A message suitable to be logged is returned in `error`, `stderr` or
 * `stdout`.
 */
export async function checkDune(
    token: vscode.CancellationToken | undefined,
    root: vscode.WorkspaceFolder,
    duneCmd: string
): Promise<Output> {
    const {
        stdout: duneVersion,
        stderr: duneStderr,
        error: cmdError,
    } = await runDuneCommand(
        {
            token,
            root,
            // eslint-disable-next-line no-magic-numbers
            sleepTime: 3,
        },
        { duneCmd, args: [c.duneVersionArg] }
    );
    if (cmdError) {
        return {
            error: `Error calling ${duneCmd} in ${root.uri.path}, can't use dune! Error message: """${cmdError}"""`,
        };
    }
    if (duneStderr?.length) {
        return {
            stderr: `Warning: ${duneCmd} ${duneVersion} did return something at stderr: """${duneStderr}"""
not sure if dune is working, but using it anyway`,
        };
    }
    if (parse.isValidVersion(duneVersion)) {
        return {
            stdout: `Dune command "${duneCmd}" is working in ${root.uri.path}.`,
        };
    }
    return {
        stderr: `Info: ${duneCmd} ${duneVersion} did return '${duneVersion}' which I could not parse as a version. Using ${duneCmd} anyway.`,
    };
}

/**
 * Return all data read from the given stream.
 * @param stream The stream to read from.
 * @returns All data read from the given stream.
 */
export async function readStream(stream: internal.Readable) {
    let out = "";
    for await (const chunk of stream) {
        out = out.concat(chunk);
    }

    return out;
}
