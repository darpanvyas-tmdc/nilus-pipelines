# nilus-pipelines

Cursor / Codex / agent skill for drafting DataOS `type: nilus` pipelines and custom sources.

Install with **`npx skills` only**. The CLI copies the full skill package (`SKILL.md`, `references/`, `templates/`) so you can `@nilus-pipelines` in chat.

Project install lands in `.agents/skills/nilus-pipelines`. Global install lands in `~/.agents/skills/nilus-pipelines`. Cursor discovers both of those paths.

## Install

```bash
# list what this repo publishes
npx skills add darpanvyas-tmdc/nilus-pipelines --list

# this project — Cursor @ mentions
npx skills add darpanvyas-tmdc/nilus-pipelines -a cursor -y

# all Cursor projects
npx skills add darpanvyas-tmdc/nilus-pipelines -g -a cursor -y

# every detected agent
npx skills add darpanvyas-tmdc/nilus-pipelines --all
```

Use `--copy` if you need a real copy instead of a symlink:

```bash
npx skills add darpanvyas-tmdc/nilus-pipelines -a cursor --copy -y
```

After install, type `@nilus-pipelines` in chat (or ask: “Draft a Nilus batch pipeline from Postgres depot X to lakehouse Y”).

Do not put the skill in `~/.cursor/skills-cursor/` (reserved for Cursor built-ins).

## Standard skill template

This repo follows the Agent Skills layout. `npx skills add` discovers `skills/<name>/SKILL.md` and installs **every file and folder** in that package:

```text
.
├── README.md
└── skills/
    └── nilus-pipelines/
        ├── SKILL.md                 # required — entry point
        ├── README.md
        ├── references/              # loaded on demand
        │   ├── domain.md
        │   ├── options.md
        │   └── custom-source.md
        └── templates/               # copy-paste YAML / Python starters
            ├── README.md
            ├── batch-depot.yml
            ├── batch-uri.yml
            ├── batch-schema-naming.yml
            ├── batch-merge.yml
            ├── batch-type-hints.yml
            ├── batch-mask.yml
            ├── batch-sample.yml
            ├── batch-partition.yml
            ├── batch-query-rename.yml
            ├── batch-jira.yml
            ├── batch-scheduled.yml
            ├── batch-pvc.yml
            ├── volume.yml
            ├── cdc-postgres.yml
            ├── cdc-mongo.yml
            ├── cdc-db2-uri.yml
            ├── metadata.yml
            ├── custom-source-pipeline.yml
            ├── custom-source.py
            └── git-sync-secret.yml
```

That matches the public spec: `SKILL.md` plus optional `references/` and extra resource dirs (`templates/` here, same role as `assets/`).
