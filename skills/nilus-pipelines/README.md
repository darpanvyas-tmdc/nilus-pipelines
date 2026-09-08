# nilus-pipelines skill

Cursor / Codex skill for drafting DataOS `type: nilus` pipelines and custom sources.

## Install

```bash
npx skills add darpanvyas-tmdc/nilus-pipelines -a cursor -y
npx skills add darpanvyas-tmdc/nilus-pipelines -g -a cursor -y
```

Ask the agent something like: “Draft a Nilus batch pipeline from Postgres depot X to lakehouse Y” or “Write a custom source for this API.”

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
