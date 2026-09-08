# nilus-pipelines skill

Cursor / Codex skill for drafting DataOS `type: nilus` pipelines and custom sources.

## Install

```bash
# this project → .cursor/skills/nilus-pipelines  (so you can @nilus-pipelines)
curl -fsSL https://raw.githubusercontent.com/darpanvyas-tmdc/nilus-pipelines/main/scripts/install-cursor.sh | bash

# all Cursor projects → ~/.cursor/skills/nilus-pipelines
curl -fsSL https://raw.githubusercontent.com/darpanvyas-tmdc/nilus-pipelines/main/scripts/install-cursor.sh | bash -s -- -g
```

Ask the agent something like: “Draft a Nilus batch pipeline from Postgres depot X to lakehouse Y” or attach `@nilus-pipelines`.

## Layout

```text
nilus-pipelines/
├── SKILL.md                 # entry point — always read first
├── references/              # extra context, loaded on demand
│   ├── domain.md
│   ├── options.md
│   └── custom-source.md
└── templates/               # copy-paste starters
    ├── *.yml
    └── custom-source.py
```
