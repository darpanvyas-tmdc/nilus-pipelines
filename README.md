# nilus-pipelines

Cursor / Codex / agent skill for drafting DataOS `type: nilus` pipelines and custom sources.

Install with **`npx skills` only**. Run it **without** `-y` / `-a` so the CLI asks you to pick agents (Cursor, Claude Code, Codex, …). It then copies the full package (`SKILL.md`, `references/`, `templates/`).

## Install

```bash
npx skills add darpanvyas-tmdc/nilus-pipelines
```

Until this branch is merged, point at the branch:

```bash
npx skills add https://github.com/darpanvyas-tmdc/nilus-pipelines/tree/npx-only-standard-skill-template
```

The prompt lets you:

1. Confirm the `nilus-pipelines` skill
2. Choose agents — **Cursor**, **Claude Code**, and any others it detects
3. Choose project vs global
4. Choose symlink (default) vs copy

Where each pick writes:

| You select | Project folder |
|---|---|
| Cursor | `.agents/skills/nilus-pipelines` |
| Claude Code | `.claude/skills/nilus-pipelines` |
| Both | both of the above (Cursor still uses `.agents`, not `.cursor`) |

Cursor reads `.agents/skills` on purpose — that is the CLI mapping for Cursor, so `@nilus-pipelines` works from there. Claude reads `.claude/skills`.

Skip the menu only when you already know the target:

```bash
npx skills add darpanvyas-tmdc/nilus-pipelines --list
npx skills add darpanvyas-tmdc/nilus-pipelines -a cursor -y
npx skills add darpanvyas-tmdc/nilus-pipelines -a claude-code -y
npx skills add darpanvyas-tmdc/nilus-pipelines -g -a cursor -a claude-code -y
npx skills add darpanvyas-tmdc/nilus-pipelines --all
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
