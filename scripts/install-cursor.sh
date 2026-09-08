#!/usr/bin/env bash
# Install nilus-pipelines into Cursor's skill folder so it can be @-mentioned.
# Usage:
#   ./scripts/install-cursor.sh        # this project → .cursor/skills/nilus-pipelines
#   ./scripts/install-cursor.sh -g     # all projects → ~/.cursor/skills/nilus-pipelines

set -euo pipefail

REPO_URL="https://github.com/darpanvyas-tmdc/nilus-pipelines.git"
SKILL_NAME="nilus-pipelines"

GLOBAL=0
if [[ "${1:-}" == "-g" || "${1:-}" == "--global" ]]; then
  GLOBAL=1
fi

if [[ "$GLOBAL" -eq 1 ]]; then
  DEST_ROOT="${HOME}/.cursor/skills"
else
  DEST_ROOT="$(pwd)/.cursor/skills"
fi

DEST="${DEST_ROOT}/${SKILL_NAME}"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

git clone --depth 1 "$REPO_URL" "$TMP/repo"
mkdir -p "$DEST_ROOT"
rm -rf "$DEST"
cp -R "$TMP/repo/skills/${SKILL_NAME}" "$DEST"

echo "Installed ${SKILL_NAME} → ${DEST}"
echo "In Cursor chat, type @${SKILL_NAME} to attach it."
