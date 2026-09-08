# nilus-pipelines skill

Cursor / Codex skill for drafting DataOS `type: nilus` pipelines and custom sources.

## Install

`npx skills` copies this whole folder (`SKILL.md`, `references/`, `templates/`).

```bash
npx skills add darpanvyas-tmdc/nilus-pipelines --list
npx skills add darpanvyas-tmdc/nilus-pipelines -a cursor -y
npx skills add darpanvyas-tmdc/nilus-pipelines -g -a cursor -y
```

Ask the agent: “Draft a Nilus batch pipeline from Postgres depot X to lakehouse Y” or attach `@nilus-pipelines`.

## Standard template

```text
nilus-pipelines/
├── SKILL.md                 # required — always read first
├── README.md
├── references/              # extra context, loaded on demand
│   ├── domain.md
│   ├── options.md
│   └── custom-source.md
└── templates/               # copy-paste starters
    ├── README.md
    ├── *.yml
    └── custom-source.py
```
