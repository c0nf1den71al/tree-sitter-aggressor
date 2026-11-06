# tree-sitter-aggressor

A [Tree-sitter](https://tree-sitter.github.io/) grammar for **Cobalt Strike
Aggressor Script** (`.cna`), which is built on the
[Sleep](http://sleep.dashnine.org/) scripting language.

It powers the companion **`zed-aggressor`** editor extension, but it is a
standard Tree-sitter grammar and can be used anywhere Tree-sitter is (Neovim,
Helix, Emacs, CLI, etc.).

## What it parses

- Comments (`#`)
- Scalars `$x`, arrays `@a`, hashes `%h`, positional args `$1`…`$9`, `@_`,
  `$null`, and `&func` references
- Pass-by-reference `\$x`, `\@a`, `\%h`
- `sub`, closures `{ … }`, and Sleep **HOES** object expressions:
  `[new Class: a, b]`, `[$obj method: arg]`, `[Class staticMethod]`,
  `[$closure: args]`
- Aggressor top-level blocks: `on`, `alias`, `ssh_alias`, `command`,
  `popup` / `menu` / `menubar` / `item`, `set`, `bind`, `keymap`
- `import a.b.C;` and `import pkg.*;`
- Control flow: `if` / `else if` / `else`, `while` (incl. `while $x (…)`),
  C-style `for`, `foreach $k => $v (…)`, `try` / `catch`, `return`, and
  `break` / `continue` / `done` / `halt` / `yield` / `throw` / `assert`
- Operators incl. word forms (`eq`, `ne`, `is`, `isa`, `in`, `iswm`,
  `ismatch`, `hasmatch`, and negations like `!iswm`)
- Strings: double-quoted with interpolation (`$var`, `%h`, `@a`, padded
  `$[10]name`), `$+` concatenation, `\c` color codes and escapes; single-quoted
  literals
- Numbers: decimal, hex (`0x3b`), floats, `L` suffix

## Status

Parses all 18 scripts in the official
[`Cobalt-Strike/aggressor_script_examples`](https://github.com/Cobalt-Strike/aggressor_script_examples)
repository with zero errors.

## Develop

```bash
npm install            # gets tree-sitter-cli
npx tree-sitter generate
npx tree-sitter parse path/to/script.cna
npx tree-sitter highlight path/to/script.cna   # needs queries/ configured
```

The generated parser (`src/parser.c`) is committed so editors can build it
without running `generate` first.

## Queries

`queries/` contains `highlights.scm`, `brackets.scm`, `indents.scm` and
`outline.scm`. The Zed extension ships its own copies under
`languages/aggressor/`.

## License

MIT.
