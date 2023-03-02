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

export const noTestsFound2 = `nbfdslkjfgh dnvôdôkvj dfhgkfdôsg
ppx_inline_test error: the following -only-test flags matched nothing: lib/interp_common.ml:61.
khbgelruts m.,b nhjsô gdfng`;

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
export const compilerError2 = `File "lib/interp_common.ml", line 59, characters 2-14:
59 |   print_string "-1.1";
       ^^^^^^^^^^^^
Error (alert deprecated): Base.print_string
[2016-09] this element comes from the stdlib distributed with OCaml.
Use [Stdio.Out_channel.output_string Stdio.stdout] instead.`;

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
 * The result object of `testError`.
 */
export const testErrorObject = [
    {
        name: "lib/interp_common.ml",
        tests: [
            {
                endCol: 29,
                line: 22,
                name: "parse true",
                startCol: 0,
            },
        ],
    },
];

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
 * The result object of `exceptionError`.
 */
export const exceptionErrorObject = [
    {
        name: "lib/interp_common.ml",
        tests: [
            {
                endCol: 37,
                line: 23,
                name: '<<ignore (parse "if")>>',
                startCol: 0,
            },
        ],
    },
];

/**
 * This test `let%test_unit` failed because of an exception.
 */
export const exceptionError2 = `File "lib/interp_common.ml", line 45, characters 0-129: parse 21.-21.2 (0.000 sec)

======================================================================
File "lib/interp_common.ml", line 45, characters 0-129: parse 21.-21.2 threw
(runtime-lib/runtime.ml.E "got unexpected result"
  ((expected 4) (got 5) (Loc lib/interp_common.ml:47:18))).
  Raised at Ppx_assert_lib__Runtime.test_result in file "runtime-lib/runtime.ml", line 106, characters 27-83
  Called from Alocaml__Interp_common.(fun) in file "lib/interp_common.ml", line 47, characters 18-21

FAILED 1 / 1 tests`;

/**
 * The result object of `exceptionError2`.
 */
export const exceptionError2Object = [
    {
        name: "lib/interp_common.ml",
        tests: [
            {
                endCol: 129,
                line: 45,
                name: "parse 21.-21.2",
                startCol: 0,
            },
        ],
    },
];

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
export const expectError2 = `File "lib/interp_common.ml", line 57, characters 0-95 (0.000 sec)
[0;31m------ [0m[0;1m/Users/roland/Documents/code/OCaml-Interp/lib/interp_common.ml[0m
[0;32m++++++ [0m[0;1m/Users/roland/Documents/code/OCaml-Interp/lib/interp_common.ml.corrected[0m
File "/Users/roland/Documents/code/OCaml-Interp/lib/interp_common.ml", line 59, characters 0-1:
[0;100;30m |[0mlet%test "parse 11-11" = true (*Binop (Subtr, Int 11, Int 11) = parse "11-11"*)
[0;100;30m |[0m
[0;100;30m |[0mlet%test_unit "parse 21.-21.2" =
[0;100;30m |[0m  (*Binop (Subtr, Float 21., Float 21.2) = parse "21.-21.2"*)
[0;100;30m |[0m   [%test_result: int] 5 ~expect:4
[0;100;30m |[0m
[0;100;30m |[0mlet%test "parse 11*11" = true (*Binop (Mult, Int 11, Int 11) = parse "11*11"*)
[0;100;30m |[0m
[0;100;30m |[0mlet%test "parse 21.*21.2" = true
[0;100;30m |[0m (* Binop (Mult, Float 21., Float 21.2) = parse "21.*21.2"*)
[0;100;30m |[0m
[0;100;30m |[0mlet%test "parse 11/-11" = true
[0;100;30m |[0m (* Binop (Div, Int 11, Unop (Minus, Int 11)) = parse "11/-11"*)
[0;100;30m |[0m
[0;100;30m |[0mlet%expect_test _ =
[0;100;30m |[0m  Stdio.Out_channel.output_string Stdio.stdout "-1.1";
[0;41;30m-|[0m[0m[0;2m  [%expect {|-1.[0m[0;31m5[0m[0;2m|}][0m[0m
[0;42;30m+|[0m[0m  [%expect {|-1.[0;32m1[0m|}][0m
[0;100;30m |[0m
[0;100;30m |[0mlet%test "parse 21./-21.2" = failwith "NO"
[0;100;30m |[0m  (*Binop (Div, Float 21., Unop (Minus, Float 21.2)) = parse "21./-21.2"*)
[0;100;30m |[0m
[0;100;30m |[0m(* =============================================================================
[0;100;30m |[0m   Error messages
[0;100;30m |[0m*)
[0;100;30m |[0m
[0;100;30m |[0mexception TypeError of string
[0;100;30m |[0mexception RuntimeError of string
[0;100;30m |[0m
[0;100;30m |[0mlet type_error s = raise (TypeError s)
[0;100;30m |[0mlet runtime_error s = raise (RuntimeError s)
[0;100;30m |[0m
[0;100;30m |[0m(** [unbound_var_err x] returns the error message for an unbound variable x. *)
[0;100;30m |[0mlet unbound_var_err x = "Unbound variable " ^ x
`;

/**
 * The result of parsing `expectError2`.
 */
export const expectError2Object = [
    {
        name: "lib/interp_common.ml",
        tests: [
            {
                line: 57,
                name: "lib/interp_common.ml Line 57",
                startCol: 0,
                endCol: 95,
                actual: "-1.1",
                expected: "-1.5",
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
