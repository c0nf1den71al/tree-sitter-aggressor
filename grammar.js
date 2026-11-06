/**
 * @file Tree-sitter grammar for Cobalt Strike Aggressor Script (.cna)
 * @author Generated for Aggressor Script / Sleep
 * @license MIT
 *
 * Aggressor Script is built on the Sleep scripting language (by Raphael Mudge).
 * This grammar targets the syntax used by Cobalt Strike .cna files: Sleep core
 * syntax plus Aggressor's top-level block keywords (on/alias/command/popup/set/...).
 */

/* eslint-disable arrow-parens */
/* eslint-disable camelcase */
/* eslint-disable-next-line spaced-comment */
/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

const PREC = {
  assign: 1,
  arrow: 2,       // =>
  or: 3,          // || or
  and: 4,         // && and
  not: 5,         // ! not (unary, low-prec word form handled separately)
  equality: 6,    // == != eq ne is isa in ismatch iswm hasmatch <=> cmp
  comparison: 7,  // < > <= >= lt gt le ge
  bor: 8,         // |
  bxor: 9,        // ^
  band: 10,       // &
  shift: 11,      // << >>
  concat: 12,     // .
  additive: 13,   // + -
  multiplicative: 14, // * / %
  power: 15,      // **
  unary: 16,      // -x !x \x
  postfix: 17,    // indexing, calls
  primary: 18,
};

// comma separated list, one or more
function commaSep1(rule) {
  return seq(rule, repeat(seq(',', rule)));
}
function commaSep(rule) {
  return optional(commaSep1(rule));
}

module.exports = grammar({
  name: 'aggressor',

  extras: $ => [
    /\s/,
    $.comment,
  ],

  word: $ => $.identifier,

  supertypes: $ => [
    $._statement,
    $._expression,
    $._primary,
  ],

  rules: {
    source_file: $ => repeat($._statement),

    // ---------------------------------------------------------------------
    // Comments
    // ---------------------------------------------------------------------
    comment: _ => token(seq('#', /.*/)),

    // ---------------------------------------------------------------------
    // Statements
    // ---------------------------------------------------------------------
    _statement: $ => choice(
      $.import_statement,
      $.block_definition,
      $.bind_statement,
      $.if_statement,
      $.while_statement,
      $.for_statement,
      $.foreach_statement,
      $.try_statement,
      $.return_statement,
      $.control_statement,
      $.expression_statement,
      $.block,
    ),

    import_statement: $ => seq(
      'import',
      field('name', $.import_path),
      optional(';'),
    ),

    import_path: $ => seq(
      $.identifier,
      repeat(seq('.', $.identifier)),
      optional(seq('.', '*')),
    ),

    // Aggressor / Sleep block-introducing keywords:
    //   sub NAME { }      alias NAME { }    ssh_alias NAME { }
    //   command NAME { }  on EVENT { }      set HOOK { }
    //   popup NAME { }    menu "label" { }  item "label" { }
    //   menubar "text" handle { }           bind KEY { }   keymap { }
    block_definition: $ => seq(
      field('keyword', $.block_keyword),
      repeat(field('header', $._header_atom)),
      field('body', $.block),
    ),

    block_keyword: _ => choice(
      'sub', 'alias', 'ssh_alias', 'command', 'on',
      'set', 'popup', 'menu', 'menubar', 'item', 'keymap',
    ),

    _header_atom: $ => choice(
      $.identifier,
      $.scoped_identifier,
      $.string,
      $.integer,
    ),

    // bind KEY { } where KEY is a key spec such as F5 or Ctrl+Shift+K.
    bind_statement: $ => seq(
      'bind',
      field('key', $.key_binding),
      field('body', $.block),
    ),

    key_binding: $ => prec.left(seq(
      choice($.identifier, $.integer),
      repeat(seq('+', choice($.identifier, $.integer))),
    )),

    block: $ => seq('{', repeat($._statement), '}'),

    if_statement: $ => prec.right(seq(
      'if',
      field('condition', $.parenthesized_expression),
      field('consequence', $.block),
      repeat(field('alternative', $.else_if_clause)),
      optional(field('alternative', $.else_clause)),
    )),

    else_if_clause: $ => seq(
      'else', 'if',
      field('condition', $.parenthesized_expression),
      field('consequence', $.block),
    ),

    else_clause: $ => seq('else', field('body', $.block)),

    while_statement: $ => seq(
      'while',
      optional(field('binding', $.scalar_variable)),
      field('condition', $.parenthesized_expression),
      field('body', $.block),
    ),

    for_statement: $ => seq(
      'for',
      '(',
      field('initializer', optional($._expression)), ';',
      field('condition', optional($._expression)), ';',
      field('update', optional($._expression)),
      ')',
      field('body', $.block),
    ),

    foreach_statement: $ => seq(
      'foreach',
      field('key', $._variable),
      optional(seq('=>', field('value', $._variable))),
      field('collection', $.parenthesized_expression),
      field('body', $.block),
    ),

    try_statement: $ => seq(
      'try',
      field('body', $.block),
      'catch',
      field('exception', $.scalar_variable),
      field('handler', $.block),
    ),

    return_statement: $ => prec.right(seq(
      'return',
      optional(field('value', $._expression)),
      optional(';'),
    )),

    control_statement: $ => prec.right(seq(
      choice('break', 'continue', 'done', 'halt', 'yield', 'throw', 'assert'),
      optional(field('value', $._expression)),
      optional(';'),
    )),

    expression_statement: $ => prec.right(seq(
      $._expression,
      optional(';'),
    )),

    // ---------------------------------------------------------------------
    // Expressions
    // ---------------------------------------------------------------------
    _expression: $ => choice(
      $.assignment_expression,
      $.binary_expression,
      $.unary_expression,
      $.update_expression,
      $.tuple_expression,
      $._primary,
    ),

    update_expression: $ => prec.left(PREC.postfix, seq(
      field('argument', $._primary),
      field('operator', choice('++', '--')),
    )),

    // ( expr ) grouping (zero or one element).
    parenthesized_expression: $ => seq('(', optional($._expression), ')'),

    // ( a, b, ... ) comma list with at least one comma; used as lvalue tuples
    // for multiple assignment and as grouped value lists.
    tuple_expression: $ => prec(PREC.primary, seq(
      '(', $._expression, repeat1(seq(',', $._expression)), ')',
    )),

    assignment_expression: $ => prec.right(PREC.assign, seq(
      field('left', choice($._primary, $.tuple_expression)),
      field('operator', choice('=', '+=', '-=', '*=', '/=', '.=', '%=', '**=', '&=', '|=', '^=')),
      field('right', $._expression),
    )),

    unary_expression: $ => prec.right(PREC.unary, seq(
      field('operator', choice('!', '-', 'not')),
      field('operand', $._expression),
    )),

    binary_expression: $ => {
      const table = [
        ['=>', PREC.arrow],
        ['||', PREC.or],
        ['or', PREC.or],
        ['&&', PREC.and],
        ['and', PREC.and],
        ['==', PREC.equality],
        ['!=', PREC.equality],
        ['eq', PREC.equality],
        ['ne', PREC.equality],
        ['is', PREC.equality],
        ['isa', PREC.equality],
        ['in', PREC.equality],
        ['cmp', PREC.equality],
        ['<=>', PREC.equality],
        ['ismatch', PREC.equality],
        ['iswm', PREC.equality],
        ['hasmatch', PREC.equality],
        ['!ismatch', PREC.equality],
        ['!iswm', PREC.equality],
        ['!in', PREC.equality],
        ['<', PREC.comparison],
        ['>', PREC.comparison],
        ['<=', PREC.comparison],
        ['>=', PREC.comparison],
        ['lt', PREC.comparison],
        ['gt', PREC.comparison],
        ['le', PREC.comparison],
        ['ge', PREC.comparison],
        ['|', PREC.bor],
        ['^', PREC.bxor],
        ['&', PREC.band],
        ['<<', PREC.shift],
        ['>>', PREC.shift],
        ['.', PREC.concat],
        ['+', PREC.additive],
        ['-', PREC.additive],
        ['*', PREC.multiplicative],
        ['/', PREC.multiplicative],
        ['%', PREC.multiplicative],
        ['**', PREC.power],
      ];
      return choice(...table.map(([operator, precedence]) => {
        const left = precedence === PREC.power ? PREC.power : precedence;
        return prec.left(precedence, seq(
          field('left', $._expression),
          field('operator', operator),
          field('right', $._expression),
        ));
      }));
    },

    _primary: $ => choice(
      $.integer,
      $.float,
      $.string,
      $.literal_string,
      $._variable,
      $.function_reference,
      $.reference,
      $.function_call,
      $.object_expression,
      $.closure,
      $.index_expression,
      $.parenthesized_expression,
      $.identifier,
      $.scoped_identifier,
    ),

    index_expression: $ => prec(PREC.postfix, seq(
      field('object', $._primary),
      repeat1(seq('[', field('index', $._expression), ']')),
    )),

    function_call: $ => prec(PREC.postfix, seq(
      field('function', choice($.identifier, $.scoped_identifier)),
      '(',
      field('arguments', optional($.argument_list)),
      ')',
    )),

    argument_list: $ => commaSep1($._expression),

    // Sleep HOES object expressions:
    //   [new Class: a, b]  [new Class]  [$obj method: a]  [$obj method]
    //   [Class staticMethod]  [$closure: args]  [lambda(...)]
    object_expression: $ => seq(
      '[',
      choice($._object_new, $._object_message),
      ']',
    ),

    _object_new: $ => seq(
      'new',
      field('class', choice($.identifier, $.scoped_identifier)),
      optional(seq(':', field('arguments', $.argument_list))),
    ),

    _object_message: $ => seq(
      field('target', $._expression),
      optional(choice(
        seq(
          field('method', $.identifier),
          optional(seq(':', field('arguments', $.argument_list))),
        ),
        seq(':', field('arguments', $.argument_list)),
      )),
    ),

    closure: $ => prec(PREC.primary, seq('{', repeat($._statement), '}')),

    // ---------------------------------------------------------------------
    // Variables & references
    // ---------------------------------------------------------------------
    _variable: $ => choice(
      $.scalar_variable,
      $.array_variable,
      $.hash_variable,
    ),

    scalar_variable: _ => token(seq('$', choice(
      /[A-Za-z_][A-Za-z0-9_]*/,
      /[0-9]+/,          // $0 .. $n positional args
      /[-+*/.]/,         // $+ and friends used in string interpolation contexts
    ))),

    array_variable: _ => token(seq('@', choice(/[A-Za-z_][A-Za-z0-9_]*/, /_/))),

    hash_variable: _ => token(seq('%', /[A-Za-z_][A-Za-z0-9_]*/)),

    function_reference: _ => token(seq('&', /[A-Za-z_][A-Za-z0-9_]*/)),

    // \$var \@arr \%hash -> pass-by-reference
    reference: $ => prec(PREC.unary, seq(
      '\\',
      field('variable', $._variable),
    )),

    // ---------------------------------------------------------------------
    // Literals
    // ---------------------------------------------------------------------
    integer: _ => token(choice(
      /0[xX][0-9a-fA-F]+[Ll]?/,
      /[0-9]+[Ll]?/,
    )),

    float: _ => token(/[0-9]+\.[0-9]+([eE][-+]?[0-9]+)?/),

    // Double-quoted, interpolated
    string: $ => seq(
      '"',
      repeat(choice(
        $.escape_sequence,
        $.interpolation,
        $.concat_operator,
        $._string_content,
      )),
      '"',
    ),

    _string_content: _ => token.immediate(prec(1, /[^"\\$%@]+/)),

    // $+ is Sleep's in-string concatenation operator token
    concat_operator: _ => token.immediate(/\$\+/),

    escape_sequence: _ => token.immediate(seq(
      '\\',
      choice(
        /[cC][0-9a-fA-F]/,   // \c4 color codes
        /[nrtbfaeov0\\"'$%@]/,
        /x[0-9a-fA-F]{2}/,
        /u[0-9a-fA-F]{4}/,
        /U[0-9a-fA-F]{8}/,
        /./,
      ),
    )),

    // Sleep string interpolation: $var, %hash, @arr, positional $1,
    // and the padded form $[width]name / $[-width]name.
    interpolation: $ => choice(
      seq(token.immediate('$'), optional($.interp_format), $._interp_name),
      seq(token.immediate('%'), $._interp_name),
      seq(token.immediate('@'), $._interp_name),
    ),

    interp_format: _ => token.immediate(/\[-?[0-9]+\]/),

    _interp_name: _ => token.immediate(/[A-Za-z_][A-Za-z0-9_]*|[0-9]+/),

    // Single-quoted, literal (no interpolation)
    literal_string: $ => seq(
      "'",
      repeat(choice(
        $.literal_escape,
        token.immediate(prec(1, /[^'\\]+/)),
      )),
      "'",
    ),

    literal_escape: _ => token.immediate(/\\./),

    // ---------------------------------------------------------------------
    // Identifiers
    // ---------------------------------------------------------------------
    identifier: _ => /[A-Za-z_][A-Za-z0-9_]*/,

    // Dotted bare-word names (class / namespace paths such as
    // java.awt.event.ActionEvent). Given higher precedence than the '.'
    // concatenation operator so `word.word` prefers the scoped reading.
    scoped_identifier: $ => prec.left(PREC.primary, seq(
      $.identifier,
      repeat1(seq('.', $.identifier)),
    )),
  },
});
