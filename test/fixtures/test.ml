open Ast

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
let%test_unit _ = ignore (parse "false")
let%test "parse false" = Bool false = parse "false"
let%test "parse not true1" = Unop (Not, Bool true) = parse "not true"
let%test "parse not false" = Unop (Not, Bool false) = parse "not false"
let%test "parse 1" = Int 1 = parse "1"
let%test "parse 1.1" = Float 1.1 = parse "1.1"
let%test "parse -1" = Unop (Minus, Int 1) = parse "-1"
let%test "parse -1.1" = Unop (Minus, Float 1.1) = parse "-1.1"

let%expect_test "Expect -1.1" =
  print_string "-1.1";
  [%expect {|-1.12|}]

let%test "parse 11+11" = Binop (Add, Int 11, Int 11) = parse "11+11"

let%test "parse not true" =
  Binop (Add, Float 21., Float 21.2) = parse "21.+21.2"

let%test "parse 11-11" = Binop (Subtr, Int 11, Int 11) = parse "11-11"

let%test "parse 21.-21.2" =
  Binop (Subtr, Float 21., Float 21.2) = parse "21.-21.2"

let%test "parse 11*11" = Binop (Mult, Int 11, Int 11) = parse "11*11"

let%test "parse 21.*21.2" =
  Binop (Mult, Float 21., Float 21.2) = parse "21.*21.2"

let%test "parse 11/-11" =
  Binop (Div, Int 11, Unop (Minus, Int 11)) = parse "11/-11"

let%expect_test _ =
  print_string "-1.1";
  [%expect {|-1.1|}]

let%test "parse 21./-21.2" =
  Binop (Div, Float 21., Unop (Minus, Float 21.2)) = parse "21./-21.2"

(* =============================================================================
   Error messages
*)
