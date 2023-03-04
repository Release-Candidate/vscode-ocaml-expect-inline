/*
 * SPDX-License-Identifier: MIT
 * Copyright (C) 2023 Roland Csaszar
 *
 * Project:  vscode-ocaml-expect-inline
 * File:     dune_tests.ts
 * Date:     28.Feb.2023
 *
 * ==============================================================================
 * Dune library configuration examples and expected results of parsing them.
 */

/**
 * Dune file using `library` and `name` stanzas.
 */
export const duneFile1 = `(library
 (name test)
 (libraries alcotest lib1 lib2
    another-lib3))`;

/**
 * The name of the library resulting from parsing `duneFile1`.
 */
export const duneFile1Lib = "test";

/**
 * Dune file using `library` and `name` stanzas, with another stanza in between.
 */
export const duneFile2 = `(library
 (wrapped false)
 (name testlib)
 (libraries alcotest lib1 lib2
    another-lib3))`;

/**
 * The name of the library resulting from parsing `duneFile2`.
 */
export const duneFile2Lib = "testlib";

/**
 * Dune file using `tests`, `libraries` and `names` stanzas. No `library`
 */
export const duneFile3 = `(tests
 (name
  testName1
  )
 (libraries alcotest
    lib1
    lib2
    another-lib3))`;

/**
 * Dune file using `library` and `name` stanzas.
 */
export const duneFile4 = `(library
 (name alocaml)
 (inline_tests)
 (preprocess
  (pps sedlex.ppx ppx_inline_test ppx_expect ppx_assert))
 (libraries sedlex menhirLib sexplib base stdio))

(menhir
 (modules parser))`;

/**
 * The name of the library resulting from parsing `duneFile4`.
 */
export const duneFile4Lib = "alocaml";
