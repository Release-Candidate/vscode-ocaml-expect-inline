/*
 * SPDX-License-Identifier: MIT
 * Copyright (C) 2023 Roland Csaszar
 *
 * Project:  vscode-ocaml-expect-inline
 * File:     test_errors.ts
 * Date:     28.Feb.2023
 *
 * ==============================================================================
 * Strings that contain inline runner test runs with errors and the expected result
 * objects.
 */

/**
 * The output of a test runner if no tests have been found to run.
 */
export const noTestsFound = `ppx_inline_test error: the following -only-test flags matched nothing: lib/interp_common.ml:57.
`;

/**
 * A compiler error.
 */
export const compilerError = `File "lib/interp_common.ml", line 5, characters 15-22:
5 | let parse (s : strings) : expr =
                   ^^^^^^^
Error: Unbound type constructor strings
Hint: Did you mean string?`;

/**
 * A compiler error.
 */
export const compilerError2 = `File "lib/interp_common.ml", line 1, characters 5-9:
1 | open Ast2
         ^^^^
Error: Unbound module Ast2
Hint: Did you mean Ast?`;

/**
 * A compiler error.
 */
export const compilerError3 = `File "lib/interp_common.ml", line 68, characters 25-38:
68 | let type_error s = raise (TypeError s)
                              ^^^^^^^^^^^^^
Error: The constructor TypeError expects 2 argument(s),
       but is applied here to 1 argument(s)`;

/**
 * A 'normal' failed inline test.
 */
export const testError = `File "lib/interp_common.ml", line 22, characters 0-29: parse true (0.000 sec)

======================================================================
File "lib/interp_common.ml", line 22, characters 0-29: parse true is false.

FAILED 1 / 1 tests
`;

/**
 * This test `let%test_unit` failed because of an exception.
 */
export const exceptionError = `File "lib/interp_common.ml", line 23, characters 0-37: <<ignore (parse "if")>> (0.000 sec)

======================================================================
File "lib/interp_common.ml", line 23, characters 0-37: <<ignore (parse "if")>> threw (Failure "Parse error in column 2: syntax error.").
  Raised at Stdlib.failwith in file "stdlib.ml", line 29, characters 17-33
  Called from Alocaml__Interp_common.(fun) in file "lib/interp_common.ml", line 23, characters 25-37

FAILED 1 / 1 tests
`;

/**
 * Failed expect test.
 * /Users/roland/Documents/code/OCaml-Interp/lib/interp_common.ml, line 34, start: 0, end: 1
 */
export const expectError1 = `File "lib/interp_common.ml", line 32, characters 0-76: Expect -1.1 (0.000 sec)
[0;31m------ [0m[0;1m/Users/roland/Documents/code/OCaml-Interp/lib/interp_common.ml[0m
[0;32m++++++ [0m[0;1m/Users/roland/Documents/code/OCaml-Interp/lib/interp_common.ml.corrected[0m
File "/Users/roland/Documents/code/OCaml-Interp/lib/interp_common.ml", line 34, characters 0-1:
[0;100;30m |[0m
[0;100;30m |[0m(*******************************************************************************
[0;100;30m |[0m    Some tests. *)
[0;100;30m |[0m
[0;100;30m |[0mlet%test "parse true" = true (*Bool true = parse "true"*)
[0;100;30m |[0mlet%test_unit _ = ignore (parse "false")
[0;100;30m |[0mlet%test "parse false" = Bool false = parse "false"
[0;100;30m |[0mlet%test "parse not true1" = Unop (Not, Bool true) = parse "not true"
[0;100;30m |[0mlet%test "parse not false" = Unop (Not, Bool false) = parse "not false"
[0;100;30m |[0mlet%test "parse 1" = Int 1 = parse "1"
[0;100;30m |[0mlet%test "parse 1.1" = Float 1.1 = parse "1.1"
[0;100;30m |[0mlet%test "parse -1" = Unop (Minus, Int 1) = parse "-1"
[0;100;30m |[0mlet%test "parse -1.1" = Unop (Minus, Float 1.1) = parse "-1.1"
[0;100;30m |[0m
[0;100;30m |[0mlet%expect_test "Expect -1.1" =
[0;100;30m |[0m  print_string "-1.1";
[0;41;30m-|[0m[0m[0;2m  [%expect {|-1.[0m[0;31m12[0m[0;2m|}][0m[0m
[0;42;30m+|[0m[0m  [%expect {|-1.[0;32m1[0m|}][0m
[0;100;30m |[0m
[0;100;30m |[0mlet%test "parse 11+11" = Binop (Add, Int 11, Int 11) = parse "11+11"
[0;100;30m |[0m
[0;100;30m |[0mlet%test "parse not true" =
[0;100;30m |[0m  Binop (Add, Float 21., Float 21.2) = parse "21.+21.2"
[0;100;30m |[0m
[0;100;30m |[0mlet%test "parse 11-11" = Binop (Subtr, Int 11, Int 11) = parse "11-11"
[0;100;30m |[0m
[0;100;30m |[0mlet%test "parse 21.-21.2" =
[0;100;30m |[0m  Binop (Subtr, Float 21., Float 21.2) = parse "21.-21.2"
[0;100;30m |[0m
[0;100;30m |[0mlet%test "parse 11*11" = Binop (Mult, Int 11, Int 11) = parse "11*11"
[0;100;30m |[0m
[0;100;30m |[0mlet%test "parse 21.*21.2" =
[0;100;30m |[0m  Binop (Mult, Float 21., Float 21.2) = parse "21.*21.2"
[0;100;30m |[0m`;

/**
 * The result of parsing `expectError1`.
 */
export const expectError1Object = [
    {
        name: "lib/interp_common.ml",
        tests: [
            {
                line: 32,
                name: "Expect -1.1",
                startCol: 0,
                endCol: 76,
                actual: "-1.1",
                expected: "-1.12",
            },
        ],
    },
];

/**
 * The same as `expectError1`, but with other formatting.
 * /Users/roland/Documents/code/OCaml-Interp/lib/interp_common.ml, line 34, start: 0, end: 1
 */
export const expectError2 = `Done: 25% (14/56, 42 left) (jobs: 0)File "lib/interp_common.ml", line 32, characters 0-76: Expect -1.1 (0.000 sec)
------ /Users/roland/Documents/code/OCaml-Interp/lib/interp_common.ml
++++++ /Users/roland/Documents/code/OCaml-Interp/lib/interp_common.ml.corrected
File "/Users/roland/Documents/code/OCaml-Interp/lib/interp_common.ml", line 34, characters 0-1:
 |
 |(*******************************************************************************
 |    Some tests. *)
 |
 |let%test "parse true" = true (*Bool true = parse "true"*)
 |let%test_unit _ = ignore (parse "false")
 |let%test "parse false" = Bool false = parse "false"
 |let%test "parse not true1" = Unop (Not, Bool true) = parse "not true"
 |let%test "parse not false" = Unop (Not, Bool false) = parse "not false"
 |let%test "parse 1" = Int 1 = parse "1"
 |let%test "parse 1.1" = Float 1.1 = parse "1.1"
 |let%test "parse -1" = Unop (Minus, Int 1) = parse "-1"
 |let%test "parse -1.1" = Unop (Minus, Float 1.1) = parse "-1.1"
 |
 |let%expect_test "Expect -1.1" =
 |  print_string "-1.1";
-|  [%expect {|-1.12|}]
+|  [%expect {|-1.1|}]
 |
 |let%test "parse 11+11" = Binop (Add, Int 11, Int 11) = parse "11+11"
 |
 |let%test "parse not true" =
 |  Binop (Add, Float 21., Float 21.2) = parse "21.+21.2"
 |
 |let%test "parse 11-11" = Binop (Subtr, Int 11, Int 11) = parse "11-11"
 |
 |let%test "parse 21.-21.2" =
 |  Binop (Subtr, Float 21., Float 21.2) = parse "21.-21.2"
 |
 |let%test "parse 11*11" = Binop (Mult, Int 11, Int 11) = parse "11*11"
 |
 |let%test "parse 21.*21.2" =
 |  Binop (Mult, Float 21., Float 21.2) = parse "21.*21.2"
 |`;

/**
 * The result of parsing `expectError2`.
 */
export const expectError2Object = [
    {
        name: "lib/interp_common.ml",
        tests: [
            {
                line: 32,
                name: "Expect -1.1",
                startCol: 0,
                endCol: 76,
                actual: "-1.1",
                expected: "-1.12",
            },
        ],
    },
];

/**
 * The errors are:
 * suite: 'AlOcaml', group: 'Big Step tests', id: 25, name: 'let ... if ... 2.'.
 * suite: 'AlOcaml', group: 'Big Step tests', id: 26, name: 'comment should be ign...'.
 */
export const twoErrors = `File "lib/interp_common.ml", line 22, characters 0-29: parse true (0.000 sec)

======================================================================
File "lib/interp_common.ml", line 22, characters 0-29: parse true is false.

FAILED 1 / 1 tests

File "lib/interp_common.ml", line 41, characters 0-30: parse 11-11 (0.000 sec)

======================================================================
File "lib/interp_common.ml", line 41, characters 0-30: parse 11-11 is false.

FAILED 1 / 1 tests
`;

/**
 * The result object of parsing `twoErrors`.
 */
export const twoErrorsObject = [];

/**
 * Three failed tests, two with a 'normal' failure and one exception.
 * To test whether the regexps correctly parse mixed error messages.
 */
export const threeErrors1 = `File "lib/interp_common.ml", line 22, characters 0-29: parse true (0.000 sec)

======================================================================
File "lib/interp_common.ml", line 22, characters 0-29: parse true is false.

FAILED 1 / 1 tests

File "lib/interp_common.ml", line 23, characters 0-37: <<ignore (parse "if")>> (0.000 sec)

======================================================================
File "lib/interp_common.ml", line 23, characters 0-37: <<ignore (parse "if")>> threw (Failure "Parse error in column 2: syntax error.").
  Raised at Stdlib.failwith in file "stdlib.ml", line 29, characters 17-33
  Called from Alocaml__Interp_common.(fun) in file "lib/interp_common.ml", line 23, characters 25-37

FAILED 1 / 1 tests

File "lib/interp_common.ml", line 41, characters 0-30: parse 11-11 (0.000 sec)

======================================================================
File "lib/interp_common.ml", line 41, characters 0-30: parse 11-11 is false.

FAILED 1 / 1 tests`;

/**
 * Three failed tests, two with a 'normal' failure and one exception.
 * To test whether the regexps correctly parse mixed error messages.
 */
export const threeErrors2 = ``;

/**
 * The result object of parsing `threeErrors1` and `threeErrors2`.
 */
export const threeErrorsObject = [];
