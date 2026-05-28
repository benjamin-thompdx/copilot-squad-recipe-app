#!/usr/bin/env bash
# .copilot/hooks/pre-tool-use.sh
#
# Layer 2: Copilot preToolUse hook — filesystem fence + dangerous command blocker.
#
# Reads JSON from stdin:
#   { "toolName": "...", "toolInput": { ... } }
#
# Outputs JSON:
#   { "permissionDecision": "allow" }                         — proceed
#   { "permissionDecision": "deny", "reason": "..." }         — blocked
#
# Blocks:
#   1. File writes to paths outside src/RecipeHub.Api/, src/RecipeHub.Web/, .squad/
#   2. Dangerous shell commands: rm -rf, DROP TABLE, TRUNCATE, format C:, etc.

set -euo pipefail

INPUT=$(cat)

# ── Helpers ──────────────────────────────────────────────────────────────────

deny() {
  printf '{"permissionDecision":"deny","reason":"%s"}\n' "$1"
  exit 1
}

allow() {
  printf '{"permissionDecision":"allow"}\n'
  exit 0
}

# Extract fields (jq preferred, grep fallback)
get_field() {
  local field="$1"
  if command -v jq &>/dev/null; then
    printf '%s' "$INPUT" | jq -r ".${field} // empty" 2>/dev/null || true
  else
    printf '%s' "$INPUT" | grep -oE "\"${field}\"\\s*:\\s*\"[^\"]*\"" | head -1 \
      | sed "s/.*\"${field}\"\\s*:\\s*\"//;s/\"//" || true
  fi
}

TOOL_NAME=$(get_field "toolName")

# ── Check 1: Filesystem fence ─────────────────────────────────────────────────
# Applies to file-writing tools
WRITE_TOOLS="create_file edit_file write_file str_replace_editor create edit"

is_write_tool() {
  for t in $WRITE_TOOLS; do
    [[ "$TOOL_NAME" == "$t" ]] && return 0
  done
  return 1
}

if is_write_tool; then
  # Extract the target path from common field names
  FILE_PATH=""
  if command -v jq &>/dev/null; then
    FILE_PATH=$(printf '%s' "$INPUT" | jq -r '
      .toolInput.path //
      .toolInput.file_path //
      .toolInput.filename //
      .path //
      .file_path //
      empty
    ' 2>/dev/null || true)
  fi

  if [[ -n "$FILE_PATH" ]]; then
    # Normalize: strip leading ./ and convert backslashes
    NORM_PATH=$(printf '%s' "$FILE_PATH" | sed 's|\\|/|g; s|^\./||')

    ALLOWED=0
    for prefix in "src/RecipeHub.Api/" "src/RecipeHub.Web/" ".squad/" "scripts/" ".husky/" ".copilot/"; do
      if [[ "$NORM_PATH" == ${prefix}* ]]; then
        ALLOWED=1
        break
      fi
    done

    if [[ "$ALLOWED" -eq 0 ]]; then
      deny "File write blocked: '$FILE_PATH' is outside the allowed directories (src/RecipeHub.Api/, src/RecipeHub.Web/, .squad/, scripts/, .husky/, .copilot/). Move your changes inside an allowed directory."
    fi
  fi
fi

# ── Check 2: Dangerous shell commands ────────────────────────────────────────
# Applies to bash/shell execution tools
SHELL_TOOLS="bash run_terminal_cmd execute_command shell run_in_terminal powershell"

is_shell_tool() {
  for t in $SHELL_TOOLS; do
    [[ "$TOOL_NAME" == "$t" ]] && return 0
  done
  return 1
}

if is_shell_tool; then
  # Extract command text
  CMD_TEXT=""
  if command -v jq &>/dev/null; then
    CMD_TEXT=$(printf '%s' "$INPUT" | jq -r '
      .toolInput.command //
      .toolInput.cmd //
      .toolInput.input //
      .command //
      empty
    ' 2>/dev/null || true)
  fi
  [[ -z "$CMD_TEXT" ]] && CMD_TEXT="$INPUT"

  check_pattern() {
    local pattern="$1"
    local reason="$2"
    if printf '%s' "$CMD_TEXT" | grep -qiE "$pattern"; then
      deny "$reason"
    fi
  }

  check_pattern 'rm\s+-rf\s+/' \
    "Dangerous command blocked: 'rm -rf /' or similar root deletion detected. Use targeted removal instead."
  check_pattern 'rm\s+-rf\s+~' \
    "Dangerous command blocked: 'rm -rf ~' (home directory deletion) is not allowed."
  check_pattern 'rm\s+-rf\s+\.' \
    "Dangerous command blocked: 'rm -rf .' or 'rm -rf ..' is not allowed."
  check_pattern 'DROP\s+TABLE' \
    "Dangerous command blocked: DROP TABLE detected. Use migrations with rollback support."
  check_pattern 'DROP\s+DATABASE' \
    "Dangerous command blocked: DROP DATABASE is not allowed. Create a backup first."
  check_pattern 'TRUNCATE\s+' \
    "Dangerous command blocked: TRUNCATE detected. Use DELETE FROM ... WHERE instead."
  check_pattern 'DELETE\s+FROM\s+\w+\s*;' \
    "Dangerous command blocked: DELETE FROM without a WHERE clause detected."
  check_pattern 'git\s+push\s+(--force|-f)\s.*(main|master)' \
    "Dangerous command blocked: Force push to main/master is not allowed."
  check_pattern 'git\s+reset\s+--hard' \
    "Dangerous command blocked: 'git reset --hard' may destroy uncommitted work. Use --soft or stash."
  check_pattern 'format\s+[Cc]:' \
    "Dangerous command blocked: Disk format command detected."
  check_pattern 'Remove-Item\s+-Recurse\s+-Force\s+[/~C]' \
    "Dangerous command blocked: Recursive force-remove on root/home paths is not allowed."
fi

# ── All checks passed ─────────────────────────────────────────────────────────
allow
