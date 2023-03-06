/*
 * SPDX-License-Identifier: MIT
 * Copyright (C) 2023 Roland Csaszar
 *
 * Project:  vscode-ocaml-expect-inline
 * File:     parsing.ts
 * Date:     28.Feb.2023
 *
 * ==============================================================================
 * Parse test lists, test results, files for tests, ...
 */

import * as h from "./extension_helpers";

/**
 * Regex to match OCaml source file names against.
 */
const ocamlFileRegex = /.*\.ml$/u;

/**
 * Regexp to escape special regexp characters in strings.
 */
const regexpRegex = /[\\^$.*+?()[\]{}|]/gu;

/**
 * Regexp to match ANSI color control sequences.
 */
// eslint-disable-next-line no-control-regex
const ansiRegexp = /\x1b\[[0-9;]*m/gu;

/**
 * Regexp to parse version numbers.
 * Ignores leading and trailing whitespace including newlines.
 * The version number is captured in the first group with name `version`.
 */
const versionRegex =
    /^[\s]*[vV]?(?:ersion)?\s*(?<version>[\p{N}][\p{N}\p{P}~]*)[\s]*$/mu;

/**
 * Regexp to match a lock error message of dune.
 */
const duneLockError =
    /^\s*Error:\s+.*?dune\s+\(.*?\).*?locked.*?build\s+directory.*$\n^.*delete.*\.lock/msu;

/**
 * Regex to parse dune library definition to get the name of the library,
 * stored in group `name`.
 * Parsing `(library (name ...))` stanzas.
 */
const duneLibraryRegex = /^\(library\s+.*?\(name\s+(?<name>\S+)\s*\)/su;

/**
 * Regex to parse the executable of an inline runner for the library name.
 * The library name is matched in the group `library`.
 */
const inlineRunnerLibrary = /inline_test_runner_(?<library>\S+)\./u;

/**
 * Regexp to parse expect and inline test lists.
 * The lists are printed on `stdout`.
 * Match groups:
 * - `file`
 * - `line`
 * - `start`
 * - `end`
 * - `name`
 */
const testListRegex =
    /^\s*File\s+"(?<file>\S+)",\s+line\s+(?<line>[\p{N}]+),\s+characters\s+(?<start>[\p{N}]+)-(?<end>[\p{N}]+):?\s+(?<name>.*?)\s*\([\p{N}.]+\s+sec\)$/gmu;

/**
 * Regex to match a compile error.
 * Match groups:
 * - `file`
 * - `line`
 * - `start`
 * - `end`
 * - `name`
 */
const compileError =
    /\s*File\s+"(?<file>\S+)",\s+line\s+(?<line>[\p{N}]+),\s+characters\s+(?<start>[\p{N}]+)-(?<end>[\p{N}]+):\s*?(?<name>.*?)\s*Error\s*.*?:/gmsu;

/**
 * Regexp to parse test results for errors.
 * The failed tests are printed to `stderr`
 *  Match groups:
 * - `file`
 * - `line`
 * - `start`
 * - `end`
 * - `name`
 */
const testErrorRegex =
    /[=]==$\n^File\s+"(?<file>\S+)",\s+line\s+(?<line>[\p{N}]+),\s+characters\s+(?<start>[\p{N}]+)-(?<end>[\p{N}]+):\s+?(?<name>[^\n]*?)\s+is.*?.$\n^FAILED/gmsu;

/**
 * Regexp to parse test results for exceptions.
 * The failed tests are printed to `stderr`.
 * Match groups:
 * - `file`
 * - `line`
 * - `start`
 * - `end`
 * - `name`
 */
const testExceptionRegex =
    /[=]==$\n^File\s+"(?<file>\S+)",\s+line\s+(?<line>[\p{N}]+),\s+characters\s+(?<start>[\p{N}]+)-(?<end>[\p{N}]+):\s+?(?<name>[^\n]*?)\s+threw.*?.$\n^FAILED/gmsu;

/**
 * Regexp to parse test results of expect tests.
 * The failed tests are printed to `stderr`.
 * The line number is not the same as the line number of the test that failed.
 * Match groups:
 * - `file`
 * - `line`
 * - `start`
 * - `end`
 * - `name`
 * - `exp` - expected value
 * - `rec` - actual value
 */
const testExpectRegex =
    /\s*File\s+"(?<file>\S+)",\s+line\s+(?<line>[\p{N}]+),\s+characters\s+(?<start>[\p{N}]+)-(?<end>[\p{N}]+):?\s*?(?<name>.*?)\s*(?:\([\p{N}.]+\s+sec\))?$.*?-\|.*?\[%expect\s+\{\|\s*(?<exp>.*?)\s*\|\}\].*?\+\|.*?\[%expect\s+\{\|\s*(?<rec>.*?)\s*\|\}\]/gmsu;

/**
 * Error message of the test runner if no matching tests to run have been found.
 */
const noTestsFoundRegex =
    /^\s*ppx_inline_test error:\s+the\s+following\s+-only-test\s+flags\s+matched\s+nothing:/msu;

/**
 * Regex to match an expect or inline test.
 * The name of the test is returned in the match group `name`.
 */
const testRegex =
    /^[ \t]*(?:let%test(?:_unit)?|let%expect_test)\s+"?(?<name>.*?)"?\s+=/dgmu;

/**
 * Return `true` if `name` has an OCaml source file suffix, `false` else.
 * @param name The filename to check.
 * @returns `true` if `name` has an OCaml source file suffix, `false` else.
 */
export function isOCamlFile(name: string) {
    return Boolean(name.match(ocamlFileRegex));
}

/**
 * Escape special regexp characters in `s`.
 * @param s The string in which to escape special characters
 * @returns The string `s` with all special characters escaped.
 */
export function escapeRegex(s: string) {
    return s.replace(regexpRegex, "\\$&");
}

/**
 * Return `true` if `s` contains a compile error, `false` else.
 * @param s The text to check.
 * @returns `true` if `s` contains a compile error, `false` else.
 */
export function isCompileError(s: string) {
    return Boolean(s.match(compileError));
}

/**
 * Return `true` if the given output (should be on `stderr`) matches the
 * 'another dune process holds the lock' error message.
 * @param s The dune output (on `stderr`) to parse.
 * @returns `true` if the given output (should be on `stderr`) matches the
 * 'another dune process holds the lock' error message. `false` else.
 */
export function isDuneLocked(s: string) {
    return Boolean(s.match(duneLockError));
}

/**
 * Remove ANSI color sequences from the string `s`.
 * @param s The string to sanitize.
 * @returns The string `s` with removed ANSI color sequences.
 */
export function removeColorCodes(s: string) {
    return s.replace(ansiRegexp, "");
}

/**
 * Return the name of the library the inline runner executable has to be
 * called with.
 * @param runnerExe The name of the inline runner executable.
 * @returns The name of the library the inline runner executable has to be
 * called with.
 */
export function getLibrary(runnerExe: string) {
    const match = runnerExe.match(inlineRunnerLibrary);
    if (match) {
        return match.groups?.library ? match.groups.library : "";
    }
    return "";
}

/**
 * Return `true` if the given string is a valid version string, `false` else.
 * If `s` is `undefined` or the empty string `""` or just whitespace, `false` is
 * returned.
 * Leading and trailing whitespace (including newlines) is ignored.
 * @param s The string to validate as a version.
 * @returns `true`, if `s` is a valid version, `false` else.
 */
export function isValidVersion(s: string | undefined) {
    if (!s?.length) {
        return false;
    }

    const m = s.match(versionRegex);
    if (m) {
        return true;
    }

    return false;
}

/**
 * Search for expect and inline test definitions in `text`.
 * Return the name of the test in `name` and the `Range` in the field `range`.
 * @param text The text to search in.
 * @returns A list of found tests as objects `{ name, range }`.
 */
export function parseTextForTests(text: string) {
    const ranges = [];
    const matches = text.matchAll(testRegex);
    for (const match of matches) {
        const { name, loc } = getLineAndCol(match, text);
        const range = h.toRange(loc.line, loc.col, loc.endCol, loc.endLine);
        ranges.push({ name, range });
    }

    return ranges;
}

/**
 * Return the first position of `match` in `text`, as line number and column
 * number.
 * The end of the match is returned in the fields `endLine` and `endCol`.
 * If it hasn't been found,
 * `{ name: "", loc: { line: 0, col: 0, endLine: 0, endCol: 0 } }` is
 * returned.
 * Require: the match `match` shall define the match group `name`.
 * @param match The match, must contain a match group `name`.
 * @param text The text to search the string in.
 * @returns The position of `match` in `text`, as line number and column
 * number. The end of the match is returned in the fields `endLine` and
 * `endCol`. The `name` is returned in the field `name`.
 */
// eslint-disable-next-line max-statements
export function getLineAndCol(match: RegExpMatchArray, text: string) {
    const name = match?.groups?.name ? match?.groups?.name : "";
    const idx = match?.index ? match.index : 0;
    const before = text.slice(0, idx);
    const col = idx - before.lastIndexOf("\n") - 1;
    const line = before.split("\n").length - 1;
    const matchLen = match?.[0].length ? match[0].length : 0;
    const after = text.slice(idx, idx + matchLen);
    const addLine = after.split("\n").length - 1;
    const endCol =
        addLine === 0 ? col + matchLen : matchLen - after.lastIndexOf("\n") - 1;
    return { name, loc: { line, col, endLine: line + addLine, endCol } };
}

/**
 * Parse the given dune stanzas for a library stanza.
 * @param s The content of a dune file to parse for a library name.
 * @returns The name of the found library on success, `undefined` if no library
 * stanza has been found.
 */
export function parseDuneLib(s: string) {
    if (!s.length) {
        return undefined;
    }

    const match = s.match(duneLibraryRegex);
    if (match) {
        return match.groups?.name;
    }

    return undefined;
}

/**
 * Parse the given list of test cases and return them.
 *
 * Return a list of objects `{ name: group, tests: [{ id, name }] }`, where
 * `group` is the name of the test group the test is in, `id` is the id of the
 * test and `name` is it's name.
 * @returns A list of objects `{ name: group, tests: [{ id, name }] }`.
 */
export function parseTestList(s: string) {
    return groupTestHelper(
        parseTestHelper(testListRegex, s, listMatchToObject)
    );
}

/**
 * Parse the given list of test results and return the tests with
 * errors.
 *
 * Return a list of objects
 * `{ name: group, tests: [{ id, name, line, startCol, endCol, expected, actual }] }`,
 * where `group` is the name of the test group the test is in, `id` is the id of
 * the test and `name` is it's name, `actual` is the actual test result and
 * `expected` is the expected test result..
 * @param s The string to parse.
 * @returns A list of objects
 * `{ name: group, tests: [{ id, name, line, startCol, endCol, expected, actual }] }`.
 */
export function parseTestErrors(s: string) {
    const sanitized = removeColorCodes(s);
    const errors = parseTestHelper<TestTypeIn>(
        testErrorRegex,
        sanitized,
        errorMatchToObject
    );
    const exceptionErrors = parseTestHelper<TestTypeIn>(
        testExceptionRegex,
        sanitized,
        exceptionMatchToObject
    );
    const expectErrors = parseTestHelper<TestTypeIn>(
        testExpectRegex,
        sanitized,
        errorMatchToObject
    );
    return groupTestHelper(errors.concat(exceptionErrors).concat(expectErrors));
}

/**
 * Parse the given string `s`  using regexp `r` and return the results as a
 * list sorted by `group`.
 * Return a list of test objects `{ group, ... }` sorted
 * by group name.
 * @param r The regexp to use to parse ethe string `s`.
 * @param s The string to parse.
 * @param matchToObject Function to convert the match object to a test oject.
 * @returns A list of test objects `{ group, ... }`
 * sorted by `group`.
 */
function parseTestHelper<T extends { group: string }>(
    r: RegExp,
    s: string,
    // eslint-disable-next-line no-unused-vars
    matchToObject: (m: RegExpMatchArray) => T
) {
    if (!s.length) {
        return [];
    }

    const matches = s.matchAll(r);

    const parsedTests = [];
    for (const match of matches) {
        parsedTests.push(matchToObject(match));
    }

    if (parsedTests.length) {
        parsedTests.sort(({ group: groupId1 }, { group: groupId2 }) =>
            groupId1.localeCompare(groupId2)
        );
    }

    return parsedTests;
}

/**
 * Return an object constructed by the match groups of `match`.
 * @param match The match object containing match groups `group`, `id`, `name`
 * `exp` and `rec`.
 * @returns The object filled with the match groups of `match`.
 */
function errorMatchToObject(match: RegExpMatchArray) {
    return {
        group: getFileName(match),
        name: getName(match),
        line: getLine(match),
        startCol: getStartCol(match),
        endCol: getEndCol(match),
        actual: getActual(match),
        expected: getExpected(match),
    };
}

/**
 * Return an object constructed by the match groups of `match`.
 * @param match The match object containing match groups `group`, `id`, `name`
 * and `excp`.
 * @returns The object filled with the match groups of `match`.
 */
function exceptionMatchToObject(match: RegExpMatchArray) {
    return {
        group: getFileName(match),
        name: getName(match),
        line: getLine(match),
        startCol: getStartCol(match),
        endCol: getEndCol(match),
    };
}

/**
 * Return an object constructed by the match groups of `match`.
 * @param match The match object containing match groups `group`, `id` and
 * `name`.
 * @returns The object filled with the match groups of `match`.
 */
function listMatchToObject(match: RegExpMatchArray) {
    return {
        group: getFileName(match),
        name: getName(match),
        line: getLine(match),
        startCol: getStartCol(match),
        endCol: getEndCol(match),
    };
}

/**
 * Return the `expected` part of a test failure.
 * @param match The matched regex to process.
 * @returns The `expected` part of a test failure.
 */
function getExpected(match: RegExpMatchArray) {
    return match.groups?.exp === undefined ? undefined : match.groups.exp;
}

/**
 * Return the `actual` part of a test failure.
 * @param match The matched regex to process.
 * @returns The `actual` part of a test failure.
 */
function getActual(match: RegExpMatchArray) {
    return match.groups?.rec === undefined ? undefined : match.groups.rec;
}

/**
 * Return the ending column of a test failure.
 * @param match The matched regex to process.
 * @returns The ending column of a test failure.
 */
function getEndCol(match: RegExpMatchArray) {
    return match.groups?.end ? parseInt(match.groups.end, 10) : 0;
}

/**
 * Return the starting column of a test failure.
 * @param match The matched regex to process.
 * @returns The starting column of a test failure.
 */
function getStartCol(match: RegExpMatchArray) {
    return match.groups?.start ? parseInt(match.groups.start, 10) : 0;
}

/**
 * Return the source line of a test failure.
 * @param match The matched regex to process.
 * @returns The source line of a test failure.
 */
function getLine(match: RegExpMatchArray) {
    return match.groups?.line ? parseInt(match.groups.line, 10) : 0;
}

/**
 * Return the source file name of a test failure.
 * @param match The matched regex to process.
 * @returns The source file name of a test failure.
 */
function getFileName(match: RegExpMatchArray) {
    return match.groups?.file ? match.groups.file : "";
}

/**
 * Return the test name of a test failure.
 * @param match The matched regex to process.
 * @returns The test name of a test failure.
 */
function getName(match: RegExpMatchArray) {
    const name = match.groups?.name ? match.groups.name.trim() : "";
    return name.length
        ? name
        : h.toTestName(getFileName(match), getLine(match));
}

/**
 * Return `true`, if the 'no tests found' error message has been found in the
 * given string, `false` else.
 *
 * @param text The string to parse for the 'no tests found' error.
 * @returns `true`, if the 'no tests found' error message has been found in the
 * given string, `false` else.
 */
export function noTestsFound(text: string) {
    const match = text.match(noTestsFoundRegex);
    if (match) {
        return true;
    }

    return false;
}

/**
 * The object of a test, which is not grouped by group.
 */
type TestTypeIn = {
    group: string;
    name: string;
    line: number;
    startCol: number;
    endCol: number;
    expected?: string;
    actual?: string;
};

/**
 * A single tests object.
 *
 * If the test is the result of parsing a list of tests, only `id` and `name`
 * are filled, `expected` and `actual` do not exist.
 *
 * If the test is the result of parsing a test error, `expected` and `actual`
 * hold the actual and expected value of that failed test.
 */
export type TestType = {
    name: string;
    line: number;
    startCol: number;
    endCol: number;
    expected?: string;
    actual?: string;
};

/**
 * Group the list of tests by field `group` and return a list of groups
 * containing lists of tests.
 * Require: `tests` is sorted by group name.
 * @param tests The list of tests to precess.
 * @returns A list of groups containing tests.
 */
function groupTestHelper(tests: TestTypeIn[]) {
    if (!tests.length) {
        return [];
    }

    let currGroup = {
        name: tests[0].group,
        tests: [] as TestType[],
    };
    const groups = [currGroup];

    for (const test of tests) {
        if (test.group !== currGroup.name) {
            currGroup = { name: test.group, tests: [] };
            groups.push(currGroup);
        }
        currGroup.tests.push(convertTestObject(test));
    }
    return groups;
}

/**
 * Convert a `TestTypeIn` object in a `TestType` object.
 * @param test The `TestTypeIn` object to convert.
 * @returns `test` as `TestType` object.
 */
function convertTestObject(test: TestTypeIn) {
    let t = {} as TestType;
    t.endCol = test.endCol;
    t.line = test.line;
    t.startCol = test.startCol;
    t.name = test.name;
    if (test.expected !== undefined) {
        t.expected = test.expected;
    }
    if (test.actual !== undefined) {
        t.actual = test.actual;
    }
    return t;
}
