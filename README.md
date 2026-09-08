# nilus-pipelines

Cursor / Codex / agent skill for drafting DataOS `type: nilus` pipelines and custom sources.

Install into **`.cursor/skills/`** so you can `@nilus-pipelines` in chat. After testers shake it out, a cleaned-up version can fold into DataOS **builder skills**.

## Install (Cursor)

These write to Cursor’s skill folder, not `.agents/`.

```bash
# this project → .cursor/skills/nilus-pipelines
curl -fsSL https://raw.githubusercontent.com/darpanvyas-tmdc/nilus-pipelines/main/scripts/install-cursor.sh | bash

# all Cursor projects → ~/.cursor/skills/nilus-pipelines
curl -fsSL https://raw.githubusercontent.com/darpanvyas-tmdc/nilus-pipelines/main/scripts/install-cursor.sh | bash -s -- -g
```

Do not put the skill in `~/.cursor/skills-cursor/` (reserved for Cursor built-ins).

In chat, type `@nilus-pipelines` (or ask: “Draft a Nilus batch pipeline from Postgres depot X to lakehouse Y”).

## Optional: `npx skills add`

The skills CLI still discovers this repo. At **project** scope, `-a cursor` installs to `.agents/skills/` (a CLI default). Prefer the Cursor script above if you want `@` mentions.

```bash
# list skills in this repo
npx skills add darpanvyas-tmdc/nilus-pipelines --list

# all projects — this one does land in ~/.cursor/skills
npx skills add darpanvyas-tmdc/nilus-pipelines -g -a cursor -y
```

## Layout

```text
.
├── README.md
├── scripts/
│   └── install-cursor.sh        # writes .cursor/skills/nilus-pipelines
└── skills/
    └── nilus-pipelines/         # discovered by `npx skills add`
        ├── SKILL.md
        ├── README.md
        ├── references/
        └── templates/
```
