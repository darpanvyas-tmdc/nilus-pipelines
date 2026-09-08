# nilus-pipelines

Cursor / Codex / agent skill for drafting DataOS `type: nilus` pipelines and custom sources.

Run a single command to scaffold the skill into **Cursor**, **Claude Code**, **Codex**, or **VS Code (Copilot)**. Cursor gets `.cursor/skills/` so you can `@nilus-pipelines`.

## Usage

```bash
npx nilus-pipelines
```

Until this branch is on npm / `main`, run it from GitHub:

```bash
npx --yes github:darpanvyas-tmdc/nilus-pipelines#npx-only-standard-skill-template
```

This launches an interactive prompt for which IDE(s) to install into:

```
nilus-pipelines — scaffolding skills

Which IDE(s) are you using? (comma-separated for multiple, e.g. 1,2)

  1  Cursor
  2  Claude Code
  3  Codex
  4  VS Code (Copilot)
  5  All

Enter number(s) (1–5):
```

Skip the menu by passing the IDE as an argument:

```bash
npx nilus-pipelines cursor
npx nilus-pipelines claude
npx nilus-pipelines 1,2
```

## What gets installed

```
.cursor/skills/                 ← Cursor (if you chose 1 or All)
  nilus-pipelines/
    SKILL.md
    README.md
    references/
    templates/
.claude/skills/                 ← Claude Code (if you chose 2 or All)
  nilus-pipelines/
    …
.codex/skills/                  ← Codex (if you chose 3 or All)
  nilus-pipelines/
    …
.github/skills/                 ← VS Code / GitHub Copilot (if you chose 4 or All)
  nilus-pipelines/
    …
```

Do not put the skill in `~/.cursor/skills-cursor/` (reserved for Cursor built-ins).

## What the skill does

Drafts DataOS `type: nilus` YAML and CustomSource Python connectors. Use when creating, fixing, or reviewing a Nilus pipeline, custom source, masking, type hints, CDC, metadata, or depot/URI addresses.

**Trigger**: type `@nilus-pipelines` or ask *"Draft a Nilus batch pipeline from Postgres depot X to lakehouse Y"*.

## Layout

```text
.
├── bin/create.js                # npx installer — copies into .cursor/skills etc.
├── package.json
├── README.md
└── skills/
    └── nilus-pipelines/
        ├── SKILL.md
        ├── README.md
        ├── references/
        │   ├── domain.md
        │   ├── options.md
        │   └── custom-source.md
        └── templates/
            ├── *.yml
            └── custom-source.py
```

## Requirements

- Node.js ≥ 16
