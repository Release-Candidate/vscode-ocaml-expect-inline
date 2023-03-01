/*
 * SPDX-License-Identifier: MIT
 * Copyright (C) 2023 Roland Csaszar
 *
 * Project:  vscode-ocaml-expect-inline
 * File:     test_lists.ts
 * Date:     28.Feb.2023
 *
 * ==============================================================================
 * Output on `stdout` of an inline test runner and the expected result objects.
 */

/**
 * The output on `stout` of an inline runner test run.
 */
export const normalList = `File "lib/interp_common.ml", line 22, characters 0-28: parse true (0.000 sec)
File "lib/interp_common.ml", line 23, characters 0-40: <<ignore (parse "false")>> (0.000 sec)
File "lib/interp_common.ml", line 24, characters 0-51: parse false (0.000 sec)
File "lib/interp_common.ml", line 25, characters 0-69: parse not true1 (0.000 sec)
File "lib/interp_common.ml", line 26, characters 0-71: parse not false (0.000 sec)
File "lib/interp_common.ml", line 27, characters 0-38: parse 1 (0.000 sec)
File "lib/interp_common.ml", line 28, characters 0-46: parse 1.1 (0.000 sec)
File "lib/interp_common.ml", line 29, characters 0-54: parse -1 (0.000 sec)
File "lib/interp_common.ml", line 30, characters 0-62: parse -1.1 (0.000 sec)
File "lib/interp_common.ml", line 32, characters 0-76: Expect -1.1 (0.000 sec)
File "lib/interp_common.ml", line 36, characters 0-68: parse 11+11 (0.000 sec)
File "lib/interp_common.ml", line 38, characters 0-83: parse not true (0.000 sec)
File "lib/interp_common.ml", line 41, characters 0-70: parse 11-11 (0.000 sec)
File "lib/interp_common.ml", line 43, characters 0-85: parse 21.-21.2 (0.000 sec)
File "lib/interp_common.ml", line 46, characters 0-69: parse 11*11 (0.000 sec)
File "lib/interp_common.ml", line 48, characters 0-84: parse 21.*21.2 (0.000 sec)
File "lib/interp_common.ml", line 51, characters 0-86: parse 11/-11 (0.000 sec)
File "lib/interp_common.ml", line 54, characters 0-63 (0.000 sec)
File "lib/interp_common.ml", line 58, characters 0-99: parse 21./-21.2 (0.000 sec)
`;

/**
 * The result object of parsing `normalList`.
 */
export const normalListObject = [
    {
        name: "lib/interp_common.ml",
        tests: [
            {
                endCol: 28,
                line: 22,
                name: "parse true",
                startCol: 0,
            },
            {
                endCol: 40,
                line: 23,
                name: '<<ignore (parse "false")>>',
                startCol: 0,
            },
            {
                endCol: 51,
                line: 24,
                name: "parse false",
                startCol: 0,
            },
            {
                endCol: 69,
                line: 25,
                name: "parse not true1",
                startCol: 0,
            },
            {
                endCol: 71,
                line: 26,
                name: "parse not false",
                startCol: 0,
            },
            {
                endCol: 38,
                line: 27,
                name: "parse 1",
                startCol: 0,
            },
            {
                endCol: 46,
                line: 28,
                name: "parse 1.1",
                startCol: 0,
            },
            {
                endCol: 54,
                line: 29,
                name: "parse -1",
                startCol: 0,
            },
            {
                endCol: 62,
                line: 30,
                name: "parse -1.1",
                startCol: 0,
            },
            {
                endCol: 76,
                line: 32,
                name: "Expect -1.1",
                startCol: 0,
            },
            {
                endCol: 68,
                line: 36,
                name: "parse 11+11",
                startCol: 0,
            },
            {
                endCol: 83,
                line: 38,
                name: "parse not true",
                startCol: 0,
            },
            {
                endCol: 70,
                line: 41,
                name: "parse 11-11",
                startCol: 0,
            },
            {
                endCol: 85,
                line: 43,
                name: "parse 21.-21.2",
                startCol: 0,
            },
            {
                endCol: 69,
                line: 46,
                name: "parse 11*11",
                startCol: 0,
            },
            {
                endCol: 84,
                line: 48,
                name: "parse 21.*21.2",
                startCol: 0,
            },
            {
                endCol: 86,
                line: 51,
                name: "parse 11/-11",
                startCol: 0,
            },
            {
                endCol: 63,
                line: 54,
                name: "lib/interp_common.ml Line 54",
                startCol: 0,
            },
            {
                endCol: 99,
                line: 58,
                name: "parse 21./-21.2",
                startCol: 0,
            },
        ],
    },
];
