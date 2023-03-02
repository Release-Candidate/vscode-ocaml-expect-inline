/*
 * SPDX-License-Identifier: MIT
 * Copyright (C) 2023 Roland Csaszar
 *
 * Project:  vscode-ocaml-expect-inline
 * File:     test_sources.ts
 * Date:     28.Feb.2023
 *
 * ==============================================================================
 * File containing test sources and the ranges of certain test names in these.
 */

import * as vscode from "vscode";

/* eslint-disable no-magic-numbers */

export const testSource1 = `open Ast
open Base


(** [parse s] parses the given program [s] and returns the AST (abstract syntax
    tree) of this program. *)
let parse (s : string) : expr =
  let lexbuf = Sedlexing.Utf8.from_string s in
  try
    let lexer = Sedlexing.with_tokenizer Lexer.token lexbuf in
    let parser = MenhirLib.Convert.Simplified.traditional2revised Parser.prog in
    let ast = parser lexer in
    ast
  with
  | Lexer.LexError msg -> failwith msg
  | Parser.Error ->
      failwith
        (Printf.sprintf "Parse error in column %d: syntax error."
           (Sedlexing.lexeme_start lexbuf))

(*******************************************************************************
    Some tests. *)

let%test "parse true" = true (*Bool true = parse "true"*)
let%test_unit _ = ignore (parse "true")
let%test "parse false" = true (*Bool false = parse "false"*)
let%test "parse not true1" = true (*Unop (Not, Bool true) = parse "not true"*)
let%test "parse not false" = true (*Unop (Not, Bool false) = parse "not false"*)
let%test "parse 1" = true (*Int 1 = parse "1"*)
let%test "parse 1.1" = false (*Float 1.1 = parse "1.1"*)
let%test "parse -1" = true (*Unop (Minus, Int 1) = parse "-1"*)
let%test "parse -1.1" = false (*Unop (Minus, Float 1.1) = parse "-1.1"*)

let%expect_test "Expect -1.1" =
  Stdio.Out_channel.output_string Stdio.stdout "-1.1";
  [%expect {|-1.1|}]

let%test "parse 11+11" = true (*Binop (Add, Int 11, Int 11) = parse "11+11"*)

let%test "parse not true" = true
 (* Binop (Add, Float 21., Float 21.2) = parse "21.+21.2"*)

let%test "parse 11-11" = true (*Binop (Subtr, Int 11, Int 11) = parse "11-11"*)

let%test_unit "parse 21.-21.2" =
  (*Binop (Subtr, Float 21., Float 21.2) = parse "21.-21.2"*)
   [%test_result: int] 5 ~expect:4

let%test "parse 11*11" = true (*Binop (Mult, Int 11, Int 11) = parse "11*11"*)

let%test "parse 21.*21.2" = true
 (* Binop (Mult, Float 21., Float 21.2) = parse "21.*21.2"*)

let%test "parse 11/-11" = true
 (* Binop (Div, Int 11, Unop (Minus, Int 11)) = parse "11/-11"*)

let%expect_test _ =
  Stdio.Out_channel.output_string Stdio.stdout "-1.1";
  [%expect {|-1.5|}]

let%test "parse 21./-21.2" = failwith "NO"
  (*Binop (Div, Float 21., Unop (Minus, Float 21.2)) = parse "21./-21.2"*)

(* =============================================================================
   Error messages
*)
`;

/**
 * The tests in `testSource1`.
 */
export const testSource1Ranges = [
    {
        name: "parse true",
        range: new vscode.Range(
            new vscode.Position(23, 0),
            new vscode.Position(23, 23)
        ),
    },
    {
        name: "_",
        range: new vscode.Range(
            new vscode.Position(24, 0),
            new vscode.Position(24, 17)
        ),
    },
    {
        name: "parse false",
        range: new vscode.Range(
            new vscode.Position(25, 0),
            new vscode.Position(25, 24)
        ),
    },
    {
        name: "parse not true1",
        range: new vscode.Range(
            new vscode.Position(26, 0),
            new vscode.Position(26, 28)
        ),
    },
    {
        name: "parse not false",
        range: new vscode.Range(
            new vscode.Position(27, 0),
            new vscode.Position(27, 28)
        ),
    },
    {
        name: "parse 1",
        range: new vscode.Range(
            new vscode.Position(28, 0),
            new vscode.Position(28, 20)
        ),
    },
    {
        name: "parse 1.1",
        range: new vscode.Range(
            new vscode.Position(29, 0),
            new vscode.Position(29, 22)
        ),
    },
    {
        name: "parse -1",
        range: new vscode.Range(
            new vscode.Position(30, 0),
            new vscode.Position(30, 21)
        ),
    },
    {
        name: "parse -1.1",
        range: new vscode.Range(
            new vscode.Position(31, 0),
            new vscode.Position(31, 23)
        ),
    },
    {
        name: "Expect -1.1",
        range: new vscode.Range(
            new vscode.Position(33, 0),
            new vscode.Position(33, 31)
        ),
    },
    {
        name: "parse 11+11",
        range: new vscode.Range(
            new vscode.Position(37, 0),
            new vscode.Position(37, 24)
        ),
    },
    {
        name: "parse not true",
        range: new vscode.Range(
            new vscode.Position(39, 0),
            new vscode.Position(39, 27)
        ),
    },
    {
        name: "parse 11-11",
        range: new vscode.Range(
            new vscode.Position(42, 0),
            new vscode.Position(42, 24)
        ),
    },
    {
        name: "parse 21.-21.2",
        range: new vscode.Range(
            new vscode.Position(44, 0),
            new vscode.Position(44, 32)
        ),
    },
    {
        name: "parse 11*11",
        range: new vscode.Range(
            new vscode.Position(48, 0),
            new vscode.Position(48, 24)
        ),
    },
    {
        name: "parse 21.*21.2",
        range: new vscode.Range(
            new vscode.Position(50, 0),
            new vscode.Position(50, 27)
        ),
    },
    {
        name: "parse 11/-11",
        range: new vscode.Range(
            new vscode.Position(53, 0),
            new vscode.Position(53, 25)
        ),
    },
    {
        name: "_",
        range: new vscode.Range(
            new vscode.Position(56, 0),
            new vscode.Position(56, 19)
        ),
    },
    {
        name: "parse 21./-21.2",
        range: new vscode.Range(
            new vscode.Position(60, 0),
            new vscode.Position(60, 28)
        ),
    },
];
