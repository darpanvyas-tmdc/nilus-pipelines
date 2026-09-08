#!/usr/bin/env node

const fs       = require('fs');
const path     = require('path');
const readline = require('readline');

const RESET  = '\x1b[0m';
const GREEN  = '\x1b[32m';
const CYAN   = '\x1b[36m';
const YELLOW = '\x1b[33m';
const BOLD   = '\x1b[1m';
const DIM    = '\x1b[2m';

function log(msg)  { process.stdout.write(msg + '\n'); }
function ok(msg)   { log(`  ${GREEN}✓${RESET}  ${msg}`); }
function info(msg) { log(`  ${CYAN}→${RESET}  ${msg}`); }
function err(msg)  { log(`  \x1b[31m✗${RESET}  ${msg}`); }

function syncDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const srcNames = new Set(fs.readdirSync(src));

  for (const entry of fs.readdirSync(dest, { withFileTypes: true })) {
    if (!srcNames.has(entry.name) || entry.name === '.git') {
      fs.rmSync(path.join(dest, entry.name), { recursive: true, force: true });
    }
  }

  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (entry.name === '.git') continue;
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    entry.isDirectory() ? syncDir(s, d) : fs.copyFileSync(s, d);
  }
}

async function createPrompt() {
  const isTTY = process.stdin.isTTY;
  const lines  = [];
  let   lineIdx = 0;

  if (!isTTY) {
    await new Promise(resolve => {
      const rl = readline.createInterface({ input: process.stdin });
      rl.on('line', l => lines.push(l.trim()));
      rl.on('close', resolve);
    });
  }

  const rl = isTTY
    ? readline.createInterface({ input: process.stdin, output: process.stdout })
    : null;

  async function ask(question) {
    if (!isTTY) {
      process.stdout.write(question);
      const ans = lineIdx < lines.length ? lines[lineIdx++] : '';
      process.stdout.write(ans + '\n');
      return ans;
    }
    return new Promise(resolve => rl.question(question, ans => resolve(ans.trim())));
  }

  function close() { if (rl) rl.close(); }
  return { ask, close };
}

const IDE_LIST = [
  { label: 'Cursor',            folder: '.cursor', aliases: ['cursor', '1'] },
  { label: 'Claude Code',       folder: '.claude', aliases: ['claude', 'claude-code', '2'] },
  { label: 'Codex',             folder: '.codex',  aliases: ['codex', '3'] },
  { label: 'VS Code (Copilot)', folder: '.github', aliases: ['vscode', 'vs-code', 'copilot', '4'] },
];

function foldersFromArg(raw) {
  const tokens = raw.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
  if (tokens.some(t => t === 'all' || t === '5')) return IDE_LIST.map(o => o.folder);
  const folders = [];
  for (const token of tokens) {
    const match = IDE_LIST.find(o => o.aliases.includes(token));
    if (!match) return null;
    if (!folders.includes(match.folder)) folders.push(match.folder);
  }
  return folders.length ? folders : null;
}

async function main() {
  const packageDir = path.join(__dirname, '..');
  const targetDir  = process.cwd();
  const cliArg     = process.argv.slice(2).join(',').trim();

  log('');
  log(`${BOLD}nilus-pipelines${RESET} — scaffolding skills`);
  log('');

  let ideFolders;

  if (cliArg) {
    ideFolders = foldersFromArg(cliArg);
    if (!ideFolders) {
      err(`Unknown IDE: "${cliArg}"`);
      log('');
      log('  Use: cursor, claude, codex, vscode, all');
      log('  Or:  1, 2, 3, 4, 5');
      log('');
      process.exit(1);
    }
    const ideLabels = ideFolders.map(f => IDE_LIST.find(o => o.folder === f).label).join(', ');
    info(`IDE(s): ${BOLD}${ideLabels}${RESET} (from CLI argument)`);
    log('');
  } else {
    const { ask, close } = await createPrompt();

    log(`${BOLD}Which IDE(s) are you using?${RESET} ${DIM}(comma-separated for multiple, e.g. 1,2)${RESET}`);
    log('');
    IDE_LIST.forEach((ide, i) => log(`  ${DIM}${i + 1}${RESET}  ${ide.label}`));
    log(`  ${DIM}${IDE_LIST.length + 1}${RESET}  All`);
    log('');

    const ideAnswer = await ask(`Enter number(s) (1–${IDE_LIST.length + 1}): `);
    close();

    ideFolders = foldersFromArg(ideAnswer);
    if (!ideFolders) {
      err(`Invalid selection "${ideAnswer}". Use numbers 1–${IDE_LIST.length + 1}, comma-separated.`);
      process.exit(1);
    }

    const ideLabels = ideFolders.map(f => IDE_LIST.find(o => o.folder === f).label).join(', ');
    log('');
    info(`IDE(s): ${BOLD}${ideLabels}${RESET}`);
    log('');
  }

  const skillsSrc = path.join(packageDir, 'skills');
  if (!fs.existsSync(skillsSrc)) {
    err('skills/ directory not found in package');
    process.exit(1);
  }

  const skills = fs.readdirSync(skillsSrc, { withFileTypes: true })
    .filter(e => e.isDirectory())
    .map(e => e.name);

  if (skills.length === 0) {
    err('No skill folders found in skills/');
    process.exit(1);
  }

  for (const ideFolder of ideFolders) {
    for (const skill of skills) {
      const src     = path.join(skillsSrc, skill);
      const dest    = path.join(targetDir, ideFolder, 'skills', skill);
      const existed = fs.existsSync(dest);
      syncDir(src, dest);
      ok(`${existed ? 'updated' : 'created'}  ${ideFolder}/skills/${skill}/`);
    }
  }

  log('');
  log(`${GREEN}${BOLD}Done!${RESET}  Your project now has:`);
  log('');
  for (const ideFolder of ideFolders) {
    for (const skill of skills) {
      info(`${ideFolder}/skills/${skill}/`);
    }
  }
  log('');
  log('In Cursor chat, type @nilus-pipelines or ask:');
  log(`  ${CYAN}"Draft a Nilus batch pipeline from Postgres depot X to lakehouse Y"${RESET}`);
  log('');
}

main().catch(e => { console.error(e); process.exit(1); });
