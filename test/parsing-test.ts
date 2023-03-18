/*
 * SPDX-License-Identifier: MIT
 * Copyright (C) 2023 Roland Csaszar
 *
 * Project:  vscode-ocaml-expect-inline
 * File:     parsing-test.ts
 * Date:     28.Feb.2023
 *
 * ==============================================================================
 * Tests for the parsing module.
 */

import * as chai from "chai";
import * as duneTests from "./fixtures/dune_tests";
import * as mocha from "mocha";
import * as opamEnvTests from "./fixtures/opamenv_tests";
import * as parse from "../src/parsing";
import * as testErrors from "./fixtures/test_errors";
import * as testLists from "./fixtures/test_lists";
import * as testSources from "./fixtures/test_sources";

/* eslint-disable max-lines-per-function */

/**
 * *****************************************************************************
 * Tests
 */
// eslint-disable-next-line max-statements
mocha.describe("Parsing Functions", () => {
    //==========================================================================
    mocha.describe("trim", () => {
        mocha.it("Empty string ''", () => {
            chai.assert.strictEqual(
                "".trim(),
                "",
                "Empty string does not change"
            );
        });
        mocha.it("Just whitespace", () => {
            chai.assert.strictEqual(
                "\n  \t \n  ".trim(),
                "",
                "'\\n  \\t \\n  ' -> ''"
            );
        });
        mocha.it("No whitespace", () => {
            chai.assert.strictEqual(
                "Foobačšľ+ťíéšťr".trim(),
                "Foobačšľ+ťíéšťr",
                "Without whitespace 'Foobačšľ+ťíéšťr' -> no change"
            );
        });
        mocha.it("Inner whitespace", () => {
            chai.assert.strictEqual(
                "Fo o\tb ač\n š ľ+\nť íé š\tťr".trim(),
                "Fo o\tb ač\n š ľ+\nť íé š\tťr",
                "Inner whitespace 'Fo o\\tb ač\\n š ľ+\\nť íé š\\tťr' -> no change"
            );
        });
        mocha.it("Outer whitespace", () => {
            chai.assert.strictEqual(
                "  \t \n foobar\n \t ".trim(),
                "foobar",
                "Outer whitespace should be removed '  \\t \\n foobar\\n \\t '-> 'foobar'"
            );
        });
    });
    //==========================================================================
    mocha.describe("escapeRegex", () => {
        mocha.it("Empty string is empty string", () => {
            chai.assert.strictEqual(parse.escapeRegex(""), "", "'' -> ''");
        });
        mocha.it("Normal string does not change", () => {
            chai.assert.strictEqual(
                parse.escapeRegex("Normal string does not change"),
                "Normal string does not change",
                "'Normal string does not change' -> 'Normal string does not change'"
            );
        });
        mocha.it("Every special character is escaped", () => {
            chai.assert.strictEqual(
                parse.escapeRegex(" \\ ^ $ . * + ? ( ) [ ] { } | - "),
                " \\\\ \\^ \\$ \\. \\* \\+ \\? \\( \\) \\[ \\] \\{ \\} \\| - ",
                "' \\ ^ $ . * + ? ( ) [ ] { } | -' -> ' \\\\ \\^ \\$ \\. \\* \\+ \\? \\( \\) \\[ \\] \\{ \\} \\| - '"
            );
        });
    });
    //==========================================================================
    mocha.describe("isValidVersion", () => {
        mocha.it("undefined is invalid", () => {
            chai.assert.strictEqual(
                // eslint-disable-next-line no-undefined
                parse.isValidVersion(undefined),
                false,
                "Not valid: `undefined`"
            );
        });
        mocha.it("Empty string is invalid", () => {
            chai.assert.strictEqual(
                parse.isValidVersion(""),
                false,
                "Not valid: ''"
            );
        });
        mocha.it("Just whitespace is invalid", () => {
            chai.assert.strictEqual(
                parse.isValidVersion("  \t\n "),
                false,
                "Not valid: '  \\t\\n '"
            );
        });
        mocha.it("3.6.2 is valid", () => {
            chai.assert.strictEqual(
                parse.isValidVersion("3.6.2"),
                true,
                "3.6.2 should be valid"
            );
        });
        mocha.it("v3.6.2 is valid", () => {
            chai.assert.strictEqual(
                parse.isValidVersion("v3.6.2"),
                true,
                "v3.6.2 should be valid"
            );
        });
        mocha.it("Version 3.6.2~9-156_78 is valid", () => {
            chai.assert.strictEqual(
                parse.isValidVersion("Version 3.6.2~9-156_78"),
                true,
                "Version 3.6.2~9-156_78 should be valid"
            );
        });
        mocha.it("2023/02/18.438413 is valid", () => {
            chai.assert.strictEqual(
                parse.isValidVersion("Version 2023/02/18.438413"),
                true,
                "Version 2023/02/18.438413 should be valid"
            );
        });
        mocha.it("VerSion 3.6.2~9 is invalid", () => {
            chai.assert.strictEqual(
                parse.isValidVersion("VerSion 3.6.2~9"),
                false,
                "VerSion 3.6.2~9 should be invalid"
            );
        });
        mocha.it("Ignores whitespace", () => {
            chai.assert.strictEqual(
                parse.isValidVersion(" 3.6.2\t\n"),
                true,
                "' 3.6.2\\t\\n' should be valid"
            );
        });
    });
    //==========================================================================
    mocha.describe("getLineAndCol", () => {
        mocha.it("Empty string -> 0:0", () => {
            chai.assert.deepEqual(
                parse.getLineAndCol("".match(/^$/gmsu) as RegExpMatchArray, ""),
                { name: "", loc: { line: 0, col: 0, endLine: 0, endCol: 0 } },
                "Empty string -> 0:0"
            );
        });
        mocha.it("Not found -> 0:0", () => {
            chai.assert.deepEqual(
                parse.getLineAndCol(
                    "fsgdfsgg".match(/A/u) as RegExpMatchArray,
                    "fsgdfsgg"
                ),
                { name: "", loc: { line: 0, col: 0, endLine: 0, endCol: 0 } },
                "Empty string -> 0:0"
            );
        });
        mocha.it("At position 0:4", () => {
            chai.assert.deepEqual(
                parse.getLineAndCol(
                    "Hello World!".match(/o/u) as RegExpMatchArray,
                    "Hello World!"
                ),
                { name: "", loc: { line: 0, col: 4, endLine: 0, endCol: 5 } },
                "Hell_o_ World!"
            );
        });
        mocha.it("At position 2:14", () => {
            chai.assert.deepEqual(
                parse.getLineAndCol(
                    "jkl\nhkkh\n01234567890123to search".match(
                        /to search/u
                    ) as RegExpMatchArray,
                    "jkl\nhkkh\n01234567890123to search"
                ),
                { name: "", loc: { line: 2, col: 14, endLine: 2, endCol: 23 } },
                "'to search' in 'jkl\\nhkkh\\n01234567890123to search'"
            );
        });
    });
    //==========================================================================
    mocha.describe("parseTextForTests", () => {
        mocha.it("Empty string -> empty list", () => {
            chai.assert.deepEqual(
                parse.parseTextForTests(""),
                [],
                "Empty string -> Empty list"
            );
        });
        mocha.it("No test in text -> empty list", () => {
            chai.assert.deepEqual(
                parse.parseTextForTests("fsgdfsgg"),
                [],
                "No test in text -> Empty list"
            );
        });
        mocha.it("parse testSource1 -> list of tests", () => {
            chai.assert.deepEqual(
                parse.parseTextForTests(testSources.testSource1),
                testSources.testSource1Ranges,
                "testSource1 -> testSource1Range"
            );
        });
    });
    //==========================================================================
    mocha.describe("isOCamlFile", () => {
        mocha.it("Empty string -> false", () => {
            chai.assert.isFalse(parse.isOCamlFile(""), "Empty string -> false");
        });
        mocha.it("Other file suffix -> false", () => {
            chai.assert.isFalse(
                parse.isOCamlFile("fda/dsad/fghsjdi.mli"),
                "fda/dsad/fghsjdi.mli -> false"
            );
        });
        mocha.it("OCaml file suffix -> true", () => {
            chai.assert.isTrue(
                parse.isOCamlFile("fd a/ds ad/fg hs jdi.ml"),
                "fd a/ds ad/fg hs jdi.ml -> true"
            );
        });
    });
    //==========================================================================
    mocha.describe("parseOpamEnv", () => {
        mocha.it("Empty string -> []", () => {
            chai.assert.deepEqual(
                parse.parseOpamEnv(""),
                [],
                "Empty string -> []"
            );
        });
        mocha.it("No environment vars -> []", () => {
            chai.assert.deepEqual(
                parse.parseOpamEnv("hugo=fasfasf\n'hfdaliehfal'"),
                [],
                "No environment vars -> []"
            );
        });
        mocha.it("Unix env vars -> env vars", () => {
            chai.assert.deepEqual(
                parse.parseOpamEnv(opamEnvTests.opamEnvUnixish),
                opamEnvTests.opamEnvUnixishObject,
                "opamEnvUnixish -> opamEnvUnixishObject"
            );
        });
        mocha.it("Windows env vars -> env vars", () => {
            chai.assert.deepEqual(
                parse.parseOpamEnv(opamEnvTests.opamEnvWin),
                opamEnvTests.opamEnvWinObject,
                "opamEnvWin -> opamEnvWinObject"
            );
        });
    });
    //==========================================================================
    mocha.describe("noTestsFound", () => {
        mocha.it("Empty string -> false", () => {
            chai.assert.isFalse(
                parse.noTestsFound(""),
                "Empty string -> false"
            );
        });
        mocha.it("Any text -> false", () => {
            chai.assert.isFalse(
                parse.noTestsFound(
                    "dfshgjkl  dfhgjdsfklgksdfjgh \njfsdfsa\nlfkjsdafô"
                ),
                "Any text -> false"
            );
        });
        mocha.it("No test found msg -> true", () => {
            chai.assert.isTrue(
                parse.noTestsFound(testErrors.noTestsFound),
                "noTestsFound -> true"
            );
        });
        mocha.it("No test found msg 2 -> true", () => {
            chai.assert.isTrue(
                parse.noTestsFound(testErrors.noTestsFound2),
                "noTestsFound2 -> true"
            );
        });
    });
    //==========================================================================
    mocha.describe("isDuneLocked", () => {
        mocha.it("Empty string -> false", () => {
            chai.assert.isFalse(
                parse.isDuneLocked(""),
                "Empty string -> false"
            );
        });
        mocha.it("Some string -> false", () => {
            chai.assert.isFalse(
                parse.isDuneLocked(
                    "hasdjkf dune sahfdj build ashjkl lock.\ndirectory."
                ),
                "Empty string -> false"
            );
        });
        mocha.it("Locked -> true", () => {
            chai.assert.isTrue(
                parse.isDuneLocked(
                    "Error: A running dune (pid: 25672) instance has locked the build directory.\nIf this is not the case, please delete _build/.lock"
                ),
                "Locked -> true"
            );
        });
    });
    //==========================================================================
    mocha.describe("parseDuneLib", () => {
        mocha.it("Empty string -> undefined", () => {
            chai.assert.isUndefined(
                parse.parseDuneLib(""),
                "Empty string -> undefined"
            );
        });
        mocha.it("Not a dune file -> undefined", () => {
            chai.assert.isUndefined(
                // eslint-disable-next-line no-undefined
                parse.parseDuneLib(
                    "shdfljkg hfdhdf (tests notest notest2) sgjlsdg hjsdfgl"
                ),
                "Not a dune file -> undefined"
            );
        });
        mocha.it("dune file -> library", () => {
            chai.assert.deepEqual(
                parse.parseDuneLib(duneTests.duneFile1),
                duneTests.duneFile1Lib,
                "duneFile1 -> duneFile1Lib"
            );
        });
        mocha.it("dune file 2 -> library", () => {
            chai.assert.deepEqual(
                parse.parseDuneLib(duneTests.duneFile2),
                duneTests.duneFile2Lib,
                "duneFile2 -> duneFile2Lib"
            );
        });
        mocha.it("dune file without library -> undefined", () => {
            chai.assert.isUndefined(
                parse.parseDuneLib(duneTests.duneFile3),
                "duneFile3 -> duneFile2Lib"
            );
        });
        mocha.it("dune file 4 -> library", () => {
            chai.assert.deepEqual(
                parse.parseDuneLib(duneTests.duneFile4),
                duneTests.duneFile4Lib,
                "duneFile4 -> duneFile4Lib"
            );
        });
    });
    //==========================================================================
    mocha.describe("isCompileError", () => {
        mocha.it("Empty string -> false", () => {
            chai.assert.deepEqual(
                parse.isCompileError(""),
                false,
                "Empty string -> false"
            );
        });
        mocha.it("Compiler error -> true", () => {
            chai.assert.deepEqual(
                parse.isCompileError(testErrors.compilerError),
                true,
                "compilerError -> true"
            );
        });
        mocha.it("Compiler error 2 -> true", () => {
            chai.assert.deepEqual(
                parse.isCompileError(testErrors.compilerError2),
                true,
                "compilerError2 -> true"
            );
        });
        mocha.it("Compiler error 3 -> true", () => {
            chai.assert.deepEqual(
                parse.isCompileError(testErrors.compilerError3),
                true,
                "compilerError3 -> true"
            );
        });
        mocha.it("List of tests -> false", () => {
            chai.assert.deepEqual(
                parse.isCompileError(testLists.normalList),
                false,
                "normalList -> false"
            );
        });
        mocha.it("test failure -> false", () => {
            chai.assert.deepEqual(
                parse.isCompileError(
                    testErrors.expectError1.concat(testErrors.expectError2)
                ),
                false,
                "expectError1 + expectError2 -> false"
            );
        });
    });
    //==========================================================================
    mocha.describe("parseTestList", () => {
        mocha.it("Empty string -> empty list", () => {
            chai.assert.deepEqual(
                parse.parseTestList(""),
                [],
                "Empty string -> empty list"
            );
        });
        mocha.it("No test list string -> empty list", () => {
            chai.assert.deepEqual(
                parse.parseTestList("bfls bdsfbl bdfbs GT  dsjkafôdsafk"),
                [],
                "'bfls bdsfbl bdfbs GT  dsjkafôdsafk' -> empty list"
            );
        });
        mocha.it("Real output -> test list", () => {
            chai.assert.deepEqual(
                parse.parseTestList(testLists.normalList),
                testLists.normalListObject,
                "normalList -> normalListObject"
            );
        });
    });
    //==========================================================================
    mocha.describe("parseTestErrors", () => {
        mocha.it("Empty string -> empty list", () => {
            chai.assert.deepEqual(
                parse.parseTestErrors(""),
                [],
                "Empty string -> empty list"
            );
        });
        mocha.it("No test list string -> empty list", () => {
            chai.assert.deepEqual(
                parse.parseTestErrors("bfls bdsfbl bdfbs GT  dsjkafôdsafk"),
                [],
                "'bfls bdsfbl bdfbs GT  dsjkafôdsafk' -> empty list"
            );
        });
        mocha.it("Failed expect test -> one test", () => {
            chai.assert.deepEqual(
                parse.parseTestErrors(testErrors.expectError1),
                testErrors.expectError1Object,
                "expectError1 -> expectError1Object"
            );
        });
        mocha.it("Failed expect test 2 -> one test", () => {
            chai.assert.deepEqual(
                parse.parseTestErrors(testErrors.expectError2),
                testErrors.expectError2Object,
                "expectError2 -> expectError2Object"
            );
        });
        mocha.it("Failed expect test 3 -> one test", () => {
            chai.assert.deepEqual(
                parse.parseTestErrors(testErrors.expectError3),
                testErrors.expectError3Object,
                "expectError3 -> expectError3Object"
            );
        });
        mocha.it("Failed test 1 -> one test", () => {
            chai.assert.deepEqual(
                parse.parseTestErrors(testErrors.testError),
                testErrors.testErrorObject,
                "exceptionError -> testErrorObject"
            );
        });
        mocha.it("Exception 1 -> one test", () => {
            chai.assert.deepEqual(
                parse.parseTestErrors(testErrors.exceptionError),
                testErrors.exceptionErrorObject,
                "exceptionError -> exceptionErrorObject"
            );
        });
        mocha.it("Exception 2 -> one test", () => {
            chai.assert.deepEqual(
                parse.parseTestErrors(testErrors.exceptionError2),
                testErrors.exceptionError2Object,
                "exceptionError2 -> exceptionError2Object"
            );
        });
        mocha.it("No errors -> no errors", () => {
            chai.assert.deepEqual(
                parse.parseTestErrors(testLists.normalList),
                [],
                "normalList -> []"
            );
        });
    });
});
