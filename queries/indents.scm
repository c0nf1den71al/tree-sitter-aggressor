; Indentation for Aggressor Script (Zed)
; Nodes captured with @indent increase the indent level for their contents;
; the matching closing delimiter dedents via @outdent.
[
  (block)
  (parenthesized_expression)
  (tuple_expression)
  (object_expression)
] @indent

[
  "}"
  ")"
  "]"
] @outdent
