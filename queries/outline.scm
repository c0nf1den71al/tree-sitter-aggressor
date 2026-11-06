; Outline / symbol navigation for Aggressor Script (Zed)
; @item marks an entry, @name is its display name, @context shows the keyword.

; sub foo { }, alias go { }, command c { }, ssh_alias s { }
(block_definition
  keyword: (block_keyword) @context
  header: (identifier) @name
  (#any-of? @context "sub" "alias" "ssh_alias" "command" "on" "set" "popup" "keymap")) @item

; menu "label" { }, item "label" { }, menubar "text" { }
(block_definition
  keyword: (block_keyword) @context
  header: (string) @name
  (#any-of? @context "menu" "item" "menubar")) @item

; bind Ctrl+K { }
(bind_statement
  "bind" @context
  (key_binding) @name) @item
