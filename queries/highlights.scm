; Tree-sitter highlights for Cobalt Strike Aggressor Script (.cna)
; Capture names follow the common tree-sitter / Zed convention.
; Zed resolves overlapping captures with "last match wins", so generic
; rules come first and more specific overrides come later.

; ---------------------------------------------------------------------------
; Comments
; ---------------------------------------------------------------------------
(comment) @comment

; ---------------------------------------------------------------------------
; Literals
; ---------------------------------------------------------------------------
(integer) @number
(float) @number

(string) @string
(literal_string) @string
(escape_sequence) @string.escape
(literal_escape) @string.escape

; In-string interpolation: $var, %hash, @arr, $[10]name
(interpolation) @variable
(interp_format) @punctuation.special
(concat_operator) @operator

; ---------------------------------------------------------------------------
; Variables
; ---------------------------------------------------------------------------
(scalar_variable) @variable
(array_variable) @variable
(hash_variable) @variable

; Positional / special variables: $0-$9, $_, $+, @_ ...
((scalar_variable) @variable.special
  (#match? @variable.special "^\\$([0-9]+|_)$"))

((array_variable) @variable.special
  (#eq? @variable.special "@_"))

; $null constant
((scalar_variable) @constant.builtin
  (#eq? @constant.builtin "$null"))

; &funcref  -> a reference to a function
(function_reference) @function

; \$x \@a \%h  -> pass-by-reference marker
(reference "\\" @operator)

; ---------------------------------------------------------------------------
; Scoped / type-like names (java.awt.Foo, common.ArtifactUtils).
; Declared before function_call so a scoped call still becomes @function.
; ---------------------------------------------------------------------------
(scoped_identifier) @type
(import_path (identifier) @namespace)

; HOES object expressions:  [new Class: ..]  [$obj method: ..]  [Class static]
(object_expression class: (identifier) @type)
(object_expression class: (scoped_identifier) @type)
(object_expression target: (identifier) @type)
(object_expression target: (scoped_identifier) @type)
(object_expression method: (identifier) @function.method)

; ---------------------------------------------------------------------------
; Function calls (generic first, built-ins override below)
; ---------------------------------------------------------------------------
(function_call function: (identifier) @function)
(function_call function: (scoped_identifier) @function)

; Sleep core built-in functions
((function_call function: (identifier) @function.builtin)
  (#any-of? @function.builtin
    "println" "print" "printAll" "printEOF" "warn" "trace"
    "size" "keys" "values" "exists" "getAll" "add" "addAll" "push" "pop"
    "shift" "unshift" "remove" "removeAt" "removeAll" "clear" "copy" "map"
    "filter" "reduce" "subarray" "sublist" "flatten" "concat" "cast"
    "sort" "sorta" "sortd" "sortn" "reverse" "search" "shuffle"
    "split" "join" "substr" "charAt" "indexOf" "lindexOf" "strlen" "strrep"
    "strsort" "left" "right" "uc" "lc" "tr" "replace" "matched" "matches"
    "hasmatch" "sprintf" "snprintf" "formatNumber" "parseNumber"
    "asc" "chr" "byteAt" "pack" "unpack" "bytef" "charf"
    "lambda" "closure" "inline" "function" "setf" "invoke" "newInstance"
    "typeOf" "iff" "systemProperties" "profile"
    "openf" "closef" "readln" "readb" "readc" "readAll" "writeb" "println"
    "bread" "bwrite" "mark" "reset" "skip" "available" "wait" "fork"
    "rand" "round" "abs" "ceil" "floor" "sqrt" "pow" "exp" "log" "int"
    "long" "double" "parse" "formatDate" "ticks" "tstamp"
    "local" "global" "this"
    "systemError" "checkError" "throw" "exit"
    "data" "setField" "getField"))

; Aggressor Script (Cobalt Strike) built-in functions and Beacon commands
((function_call function: (identifier) @function.builtin)
  (#any-of? @function.builtin
    "beacon_command_register" "beacon_command_detail" "beacon_command_describe"
    "beacon_command_group" "beacon_command_register" "beacon_remove_command"
    "beacons" "beacon_data" "beacon_info" "beacon_ids" "bdata"
    "ssh_command_register" "ssh_command_detail" "ssh_alias"
    "blog" "blog2" "berror" "btask" "binput" "bnote" "bcheckin"
    "bshell" "bshell!" "bpowershell" "bpowershell_import" "bpowerpick"
    "bpsinject" "bexecute" "bexecute_assembly" "binline_execute"
    "bdllload" "bdllinject" "bdllspawn" "bspawn" "bspawnas" "bspawnto"
    "binject" "bcd" "bpwd" "bls" "bmkdir" "bmv" "bcp" "brm" "bdownload"
    "bupload" "bupload_raw" "bcancel" "bjobs" "bjobkill" "bkill" "bps"
    "bpause" "bsleep" "bclear" "bconnect" "bunlink" "blink" "bssh" "bssh_key"
    "bcovertvpn" "bdcsync" "bdesktop" "bdllload" "bdrives" "belevate"
    "belevate_command" "bgetprivs" "bgetsystem" "bgetuid" "bhashdump"
    "bkerberos_ccache_use" "bkerberos_ticket_purge" "bkerberos_ticket_use"
    "bkeylogger" "blogonpasswords" "bmimikatz" "bmode" "bnet" "bportscan"
    "bppid" "bprintscreen" "bpsexec" "bpsexec_psh" "bpsexec_command"
    "brev2self" "brportfwd" "brportfwd_stop" "brunas" "brunu" "brun"
    "bscreenshot" "bscreenwatch" "bshinject" "bshspawn" "bspunnel"
    "bsocks" "bsocks_stop" "bspawnu" "bsteal_token" "bsteal_token"
    "btimestomp" "bwdigest" "bwinrm" "bwmi" "bexecute_assembly"
    "artifact_general" "artifact_payload" "artifact_sign" "artifact_stager"
    "artifact_stageless" "stager" "stager_bind_pipe" "stager_bind_tcp"
    "shellcode" "transform" "transform_vbs" "transform_python" "setup_reflective_loader"
    "powershell" "powershell_command" "pivoting"
    "data_query" "data_keys" "data_remove" "data_add"
    "site_host" "site_kill" "site_megabytes" "site_configuration"
    "listeners" "listeners_local" "listener_info" "listener_create"
    "listener_create_ext" "listener_delete" "listener_restart"
    "call" "fire_event" "fireEvent" "on" "when" "sub"
    "dialog" "dialog_show" "dialog_description" "drow_beacon" "drow_checkbox"
    "drow_combobox" "drow_exploits" "drow_file" "drow_file_open" "drow_file_save"
    "drow_interval" "drow_krbtgt" "drow_listener" "drow_listener_stage"
    "drow_listener_smb" "drow_mailserver" "drow_proxyserver" "drow_site"
    "drow_text" "drow_text_big" "dbutton_action" "dbutton_help"
    "prompt_text" "prompt_confirm" "prompt_file_open" "prompt_file_save"
    "prompt_directory_open" "show_message" "show_error" "show_popup"
    "popup_clear" "popup" "menubar" "menu" "item" "separator" "insert_menu"
    "addTab" "openTab" "closeTab" "addVisualization" "add_to_clipboard"
    "getAggressorClient" "aggressor" "colorPanel" "console_action"
    "elog" "action" "alias" "command" "index" "spawn_to"
    "localip" "resolve" "resolv" "gethostname" "format_size" "dstamp" "tstamp"
    "base64_encode" "base64_decode" "url_encode" "url_decode"
    "encode" "decode" "digest" "random_hex" "rand" "str_chunk" "str_rep"
    "credential_add" "credentials" "targets" "target_add" "target_remove"
    "services" "applications" "sites" "downloads" "archives" "screenshots"
    "keystrokes" "pivots" "socks" "highlight" "input" "unpack" "pack"))

; Scope-declaration pseudo-functions read best as keywords
((function_call function: (identifier) @keyword)
  (#any-of? @keyword "local" "global" "this" "inline"))

; ---------------------------------------------------------------------------
; Definitions (block headers)
; ---------------------------------------------------------------------------
(block_definition
  keyword: (block_keyword) @_k
  header: (identifier) @function
  (#any-of? @_k "sub" "alias" "ssh_alias" "command"))

(block_definition
  keyword: (block_keyword) @_k
  header: (identifier) @function.special
  (#eq? @_k "on"))

(block_definition
  keyword: (block_keyword) @_k
  header: (identifier) @constant
  (#eq? @_k "set"))

(block_definition
  keyword: (block_keyword) @_k
  header: (identifier) @label
  (#any-of? @_k "popup" "menu" "menubar" "item" "keymap"))

(bind_statement (key_binding) @constant)

; ---------------------------------------------------------------------------
; Keywords
; ---------------------------------------------------------------------------
(block_keyword) @keyword

[
  "if" "else" "while" "for" "foreach" "import" "return"
  "try" "catch" "new" "bind"
] @keyword

[
  "break" "continue" "done" "halt" "yield" "throw" "assert"
] @keyword

; Word operators
[
  "eq" "ne" "lt" "gt" "le" "ge" "cmp" "is" "isa" "in"
  "iswm" "ismatch" "hasmatch" "!iswm" "!ismatch" "!in"
  "and" "or" "not"
] @keyword.operator

; ---------------------------------------------------------------------------
; Operators
; ---------------------------------------------------------------------------
[
  "=" "+=" "-=" "*=" "/=" ".=" "%=" "**=" "&=" "|=" "^="
  "==" "!=" "<" ">" "<=" ">="
  "+" "-" "*" "/" "%" "**"
  "." "<<" ">>" "&" "|" "^" "!" "++" "--"
  "=>"
] @operator

; ---------------------------------------------------------------------------
; Punctuation
; ---------------------------------------------------------------------------
[ "(" ")" "[" "]" "{" "}" ] @punctuation.bracket
[ "," ";" ":" ] @punctuation.delimiter
