# nilus-pipelines skill

Cursor / Codex skill for drafting DataOS `type: nilus` pipelines and custom sources.

## Install

From the project root:

```bash
npx --yes github:darpanvyas-tmdc/nilus-pipelines
```

Pick **1  Cursor** to write `.cursor/skills/nilus-pipelines/` (full folder: `SKILL.md`, `references/`, `templates/`).

Cursor only, no prompt:

```bash
npx --yes github:darpanvyas-tmdc/nilus-pipelines cursor
```

Ask the agent: “Draft a Nilus batch pipeline from Postgres depot X to lakehouse Y” or attach `@nilus-pipelines`.

## Standard template

```text
nilus-pipelines/
├── SKILL.md
├── README.md
├── references/
│   ├── domain.md
│   ├── options.md
│   └── custom-source.md
└── templates/
    ├── README.md
    ├── *.yml
    └── custom-source.py
```
