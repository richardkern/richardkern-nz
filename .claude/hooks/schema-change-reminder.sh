#!/bin/bash
# PostToolUse(Edit|Write|MultiEdit) reminder for Payload schema changes.
#
# Two Payload footguns this repo has hit before:
#   1. payload-types.ts drifts if you forget `pnpm generate:types` after a schema
#      or field change (and it must never be hand-edited).
#   2. The admin importMap blanks /admin *in production only* if it goes stale
#      after a plugin/config change — and `generate:importmap` must run with the
#      R2_* vars set, or the storage-s3 handler is dropped from the map.
#
# This hook only reminds (non-blocking): it surfaces additionalContext so the
# agent knows to regenerate. It does NOT auto-run generate:importmap, because
# running it without R2_* set would actively write the wrong (S3-less) map.
input=$(cat)
path=$(printf '%s' "$input" | jq -r '.tool_input.file_path // empty')
[ -z "$path" ] && exit 0

# Normalise to a repo-relative-ish match on substrings, so absolute or relative
# paths both work.
types_change=false
importmap_change=false

case "$path" in
  */src/collections/*|*/src/globals/*|*/src/fields/*|*/src/plugins/*|*/src/payload.config.ts)
    types_change=true ;;
esac
case "$path" in
  */src/plugins/*|*/src/payload.config.ts)
    importmap_change=true ;;
esac

# Ignore generated outputs themselves.
case "$path" in
  */payload-types.ts|*/importMap.js) exit 0 ;;
esac

[ "$types_change" = false ] && [ "$importmap_change" = false ] && exit 0

msg="Payload schema file changed ($(basename "$path"))."
if [ "$types_change" = true ]; then
  msg="$msg Run \`pnpm generate:types\` to regenerate payload-types.ts (never hand-edit it)."
fi
if [ "$importmap_change" = true ]; then
  msg="$msg This may change the admin importMap: run \`pnpm generate:importmap\` WITH the R2_* vars set (the storage-s3 handler only registers when they are), then commit the updated importMap.js. A stale map blanks /admin in production only."
fi

jq -n --arg ctx "$msg" '{
  hookSpecificOutput: {
    hookEventName: "PostToolUse",
    additionalContext: $ctx
  }
}'
exit 0
