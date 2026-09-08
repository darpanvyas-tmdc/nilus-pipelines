# nilus-pipelines

Cursor / Codex / agent skill for drafting DataOS `type: nilus` pipelines and custom sources.

Install with [`npx skills add`](https://github.com/vercel-labs/skills). After testers shake it out, a cleaned-up version can fold into DataOS **builder skills**.

## Install

```bash
# Cursor — this project
npx skills add darpanvyas-tmdc/nilus-pipelines -a cursor -y

# Cursor — all projects
npx skills add darpanvyas-tmdc/nilus-pipelines -g -a cursor -y

# Cursor + Codex
npx skills add darpanvyas-tmdc/nilus-pipelines -a cursor -a codex -y

# Interactive (pick agents yourself)
npx skills add darpanvyas-tmdc/nilus-pipelines
```

List skills in this repo without installing:

```bash
npx skills add darpanvyas-tmdc/nilus-pipelines --list
```

Do not put the skill in `~/.cursor/skills-cursor/` (reserved for Cursor built-ins).

Ask the agent something like: “Draft a Nilus batch pipeline from Postgres depot X to lakehouse Y” or “Write a custom source for this API.”

## Update

```bash
npx skills update nilus-pipelines
```

## Layout

```text
.
├── README.md
└── skills/
    └── nilus-pipelines/         # discovered by `npx skills add`
        ├── SKILL.md             # entry point
        ├── README.md
        ├── references/
        └── templates/
```
