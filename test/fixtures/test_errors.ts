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
 * Not a compile error.
 */
export const noCompileError = `File "test/expect-tests/findlib_tests.ml", line 137, characters 0-575 (0.001 sec)
------ /Users/roland/Documents/code/dune/test/expect-tests/findlib_tests.ml
++++++ /Users/roland/Documents/code/dune/test/expect-tests/findlib_tests.ml.corrected
File "/Users/roland/Documents/code/dune/test/expect-tests/findlib_tests.ml", line 140, characters 0-1:
 |              ; add_rules = []
 |              }
 |          }
 |    ; subs = []
 |    } |}]
 |
 |let conf () =
 |  Findlib.Config.load
 |    (Path.Outside_build_dir.relative db_path "../toolchain")
 |    ~toolchain:"tlc" ~context:"<context>"
 |  |> Memo.run
 |  |> Test_scheduler.(run (create ()))
 |
 |let%expect_test _ =
 |  let conf = conf () in
 |  print_dyn (Findlib.Config.to_dyn conf);
-|  [%expect
-|    {|
-|    { vars =
-|        map
-|          { "FOO_BAR" :
-|              { set_rules =
-|                  [ { preds_required = set { "env"; "tlc" }
-|                    ; preds_forbidden = set {}
-|                    ; value = "my variable"
-|                    }
-|                  ]
-|              ; add_rules = []
-|              }
-|          }
-|    ; preds = set { "tlc" }
-|    } |}];
+|  [%expect.unreachable];
-|  print_dyn (Env.to_dyn (Findlib.Config.env conf));
-|  [%expect {| map { "FOO_BAR" : "my variable" } |}]
+|  print_dyn (Env.to_dyn (Findlib.Config.env conf));
+|  [%expect.unreachable]
+|[@@expect.uncaught_exn {|
+|  ( "Error: ocamlfind toolchain tlc isn't defined in\\
+|   \\n/Users/roland/Documents/code/dune/../unit-tests/findlib-db/../toolchain.d\\
+|   \\n(context: <context>)\\
+|   \\n") |}]
`;

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
                actual: "-|  [%expect {|-1.12|}]\n+|  [%expect {|-1.1|}]",
            },
        ],
    },
];

/**
 * The same as `expectError1`, but with other formatting.
 * /Users/roland/Documents/code/OCaml-Interp/lib/interp_common.ml, line 34, start: 0, end: 1
 */
export const expectError2 = `File "lib/interp_common.ml", line 57, characters 0-95 (0.000 sec)
------ /Users/roland/Documents/code/OCaml-Interp/lib/interp_common.ml
++++++ /Users/roland/Documents/code/OCaml-Interp/lib/interp_common.ml.corrected
File "/Users/roland/Documents/code/OCaml-Interp/lib/interp_common.ml", line 59, characters 0-1:
 |let%test "parse 11-11" = true (*Binop (Subtr, Int 11, Int 11) = parse "11-11"*)
 |
 |let%test_unit "parse 21.-21.2" =
 |  (*Binop (Subtr, Float 21., Float 21.2) = parse "21.-21.2"*)
 |   [%test_result: int] 5 ~expect:4
 |
 |let%test "parse 11*11" = true (*Binop (Mult, Int 11, Int 11) = parse "11*11"*)
 |
 |let%test "parse 21.*21.2" = true
 | (* Binop (Mult, Float 21., Float 21.2) = parse "21.*21.2"*)
 |
 |let%test "parse 11/-11" = true
 | (* Binop (Div, Int 11, Unop (Minus, Int 11)) = parse "11/-11"*)
 |
 |let%expect_test _ =
 |  Stdio.Out_channel.output_string Stdio.stdout "-1.1";
-|  [%expect {|-1.5|}]
+|  [%expect {|-1.1|}]
 |
 |let%test "parse 21./-21.2" = failwith "NO"
 |  (*Binop (Div, Float 21., Unop (Minus, Float 21.2)) = parse "21./-21.2"*)
 |
 |(* =============================================================================
 |   Error messages
 |*)
 |
 |exception TypeError of string
 |exception RuntimeError of string
 |
 |let type_error s = raise (TypeError s)
 |let runtime_error s = raise (RuntimeError s)
 |
 |(** [unbound_var_err x] returns the error message for an unbound variable x. *)
 |let unbound_var_err x = "Unbound variable " ^ x
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
                actual: "-|  [%expect {|-1.5|}]\n+|  [%expect {|-1.1|}]",
            },
        ],
    },
];

/**
 * Expect error with an empty 'expect' value.
 */
export const expectError3 = `File "lib/interp_common.ml", line 34, characters 0-104: Add this (0.001 sec)
------ /Users/roland/Documents/code/OCaml-Interp/lib/interp_common.ml
++++++ /Users/roland/Documents/code/OCaml-Interp/lib/interp_common.ml.corrected
File "/Users/roland/Documents/code/OCaml-Interp/lib/interp_common.ml", line 36, characters 0-1:
 |
 |(*******************************************************************************
 |    Some tests. *)
 |
 |let%test "parse true" = true (*Bool true = parse "true"*)
 |let%test_unit _ = ignore (parse "true")
 |let%test "parse false" = true (*Bool false = parse "false"*)
 |let%test "parse not true1" = true (*Unop (Not, Bool true) = parse "not true"*)
 |let%test "parse not false" = true (*Unop (Not, Bool false) = parse "not false"*)
 |let%test "parse 1" = true (*Int 1 = parse "1"*)
 |let%test "parse 1.1" = false (*Float 1.1 = parse "1.1"*)
 |let%test "parse -1" = true (*Unop (Minus, Int 1) = parse "-1"*)
 |let%test "parse -1.1" = false (*Unop (Minus, Float 1.1) = parse "-1.1"*)
 |
 |let%expect_test "Add this" =
 |  Stdio.Out_channel.output_string Stdio.stdout "Add this";
-|  [%expect {||}]
+|  [%expect {| Add this |}]
 |
 |let%expect_test "Expect -1.1" =
 |  Stdio.Out_channel.output_string Stdio.stdout "-1.1";
 |  [%expect {|-1.1|}]
 |
 |let%test "parse 11+11" = true (*Binop (Add, Int 11, Int 11) = parse "11+11"*)
 |
 |let%test "parse not true" = true
 | (* Binop (Add, Float 21., Float 21.2) = parse "21.+21.2"*)
 |
 |let%test "parse 11-11" = true (*Binop (Subtr, Int 11, Int 11) = parse "11-11"*)
 |
 |let%test_unit "parse 21.-21.2" =
 |  (*Binop (Subtr, Float 21., Float 21.2) = parse "21.-21.2"*)
 |   [%test_result: int] 5 ~expect:4
 |
`;

/**
 * The result of parsing `expectError3`.
 */
export const expectError3Object = [
    {
        name: "lib/interp_common.ml",
        tests: [
            {
                line: 34,
                name: "Add this",
                startCol: 0,
                endCol: 104,
                actual: "-|  [%expect {||}]\n+|  [%expect {| Add this |}]",
            },
        ],
    },
];

/**
 * Expect error with an empty 'expect' value.
 */
export const expectError4 = `File "test/expect-tests/findlib_tests.ml", line 137, characters 0-575 (0.001 sec)
------ /Users/roland/Documents/code/dune/test/expect-tests/findlib_tests.ml
++++++ /Users/roland/Documents/code/dune/test/expect-tests/findlib_tests.ml.corrected
File "/Users/roland/Documents/code/dune/test/expect-tests/findlib_tests.ml", line 140, characters 0-1:
 |              ; add_rules = []
 |              }
 |          }
 |    ; subs = []
 |    } |}]
 |
 |let conf () =
 |  Findlib.Config.load
 |    (Path.Outside_build_dir.relative db_path "../toolchain")
 |    ~toolchain:"tlc" ~context:"<context>"
 |  |> Memo.run
 |  |> Test_scheduler.(run (create ()))
 |
 |let%expect_test _ =
 |  let conf = conf () in
 |  print_dyn (Findlib.Config.to_dyn conf);
-|  [%expect
-|    {|
-|    { vars =
-|        map
-|          { "FOO_BAR" :
-|              { set_rules =
-|                  [ { preds_required = set { "env"; "tlc" }
-|                    ; preds_forbidden = set {}
-|                    ; value = "my variable"
-|                    }
-|                  ]
-|              ; add_rules = []
-|              }
-|          }
-|    ; preds = set { "tlc" }
-|    } |}];
+|  [%expect.unreachable];
-|  print_dyn (Env.to_dyn (Findlib.Config.env conf));
-|  [%expect {| map { "FOO_BAR" : "my variable" } |}]
+|  print_dyn (Env.to_dyn (Findlib.Config.env conf));
+|  [%expect.unreachable]
+|[@@expect.uncaught_exn {|
+|  ( "Error: ocamlfind toolchain tlc isn't defined in\\
+|   \\n/Users/roland/Documents/code/dune/../unit-tests/findlib-db/../toolchain.d\\
+|   \\n(context: <context>)\\
+|   \\n") |}]
`;

/**
 * The result of parsing `expectError4`.
 */
export const expectError4Object = [
    {
        name: "test/expect-tests/findlib_tests.ml",
        tests: [
            {
                line: 137,
                name: "test/expect-tests/findlib_tests.ml Line 137",
                startCol: 0,
                endCol: 575,
                actual: '-|  [%expect\n-|    {|\n-|    { vars =\n-|        map\n-|          { "FOO_BAR" :\n-|              { set_rules =\n-|                  [ { preds_required = set { "env"; "tlc" }\n-|                    ; preds_forbidden = set {}\n-|                    ; value = "my variable"\n-|                    }\n-|                  ]\n-|              ; add_rules = []\n-|              }\n-|          }\n-|    ; preds = set { "tlc" }\n-|    } |}];\n+|  [%expect.unreachable];\n-|  print_dyn (Env.to_dyn (Findlib.Config.env conf));\n-|  [%expect {| map { "FOO_BAR" : "my variable" } |}]\n+|  print_dyn (Env.to_dyn (Findlib.Config.env conf));\n+|  [%expect.unreachable]\n+|[@@expect.uncaught_exn {|\n+|  ( "Error: ocamlfind toolchain tlc isn\'t defined in\\\n+|   \\n/Users/roland/Documents/code/dune/../unit-tests/findlib-db/../toolchain.d\\\n+|   \\n(context: <context>)\\\n+|   \\n") |}]',
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
