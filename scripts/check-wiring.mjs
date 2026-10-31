#!/usr/bin/env node
// Wiring guard: every skill handoff resolves. Checks that bundled files a skill
// names exist, that backticked `/commands` name a real skill (or an agent built
// in), that hook commands point at shipped scripts, and that the review loop's
// state template carries the keys its Stop hook reads. Zero dependencies.
// Run: node scripts/check-wiring.mjs   (exit 1 on any problem)
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const SKILLS_DIR = fileURLToPath(new URL('../skills/', import.meta.url));
const BUILT_INS = new Set(['clear', 'compact', 'model', 'loop', 'help', 'init', 'config', 'hooks', 'agents', 'mcp', 'resume', 'memory']);
const BUNDLED_PATH = /`([\w.-]+(?:\/[\w.-]+)+\.(?:md|mjs|js|json|yaml|html|css|sh))`/g;
// An opening backtick (start or after space/paren), so `a.md`/the is not read as a command.
const COMMAND = /(?<=^|[\s(])`\/([a-z][a-z0-9-]*)(?=[\s`])/gm;
// Only a handoff verb nearby marks a command; `/signup` after "visit" is an app route.
const HANDOFF = /\b(run|runs|running|offer|offers|suggest|suggests|route|routes|use|invoke|call|calls|chain|chains|then|next|via|hand|hands|send|sends)\b|→/i;
const CONTEXT_CHARS = 40;
const HOOK = /node \.claude\/skills\/([\w-]+)\/(scripts\/[\w.-]+)/g;
const GATE_KEYS = ['status', 'evals'];

/** Problems in one file. `exists(path)` takes a path relative to the skills folder. */
export function findProblems({ skill, file, text, skillDirs, subdirs, exists }) {
  const known = new Set(skillDirs);
  const bundled = [...text.matchAll(BUNDLED_PATH)]
    .map(([, path]) => path)
    .filter((path) => subdirs.includes(path.split('/')[0]) && !exists(`${skill}/${path}`))
    .map((path) => `${file}: names \`${path}\` but ${skill}/${path} does not exist`);
  const commands = [...text.matchAll(COMMAND)]
    .filter((match) => HANDOFF.test(text.slice(Math.max(0, match.index - CONTEXT_CHARS), match.index)))
    .map(([, name]) => name)
    .filter((name) => !known.has(name) && !BUILT_INS.has(name))
    .map((name) => `${file}: runs \`/${name}\` but there is no ${name} skill`);
  const hooks = [...text.matchAll(HOOK)]
    .filter(([, target, script]) => !exists(`${target}/${script}`))
    .map(([match]) => `${file}: hook \`${match}\` points at a missing script`);
  return [...bundled, ...commands, ...hooks];
}

const walk = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? walk(join(dir, entry.name)) : [join(dir, entry.name)],
  );

function gateKeyProblems() {
  const template = join(SKILLS_DIR, 'review-loop/references/state-template.md');
  if (!existsSync(template)) return [];
  const head = /^---\n([\s\S]*?)\n---/.exec(readFileSync(template, 'utf8'))?.[1] ?? '';
  return GATE_KEYS.filter((key) => !new RegExp(`^${key}:`, 'm').test(head)).map(
    (key) => `review-loop/references/state-template.md: missing \`${key}:\`, which scripts/eval-gate.mjs reads`,
  );
}

export function checkRepo() {
  const skillDirs = readdirSync(SKILLS_DIR).filter((name) => statSync(join(SKILLS_DIR, name)).isDirectory());
  const exists = (path) => existsSync(join(SKILLS_DIR, path));
  const fileProblems = skillDirs.flatMap((skill) => {
    const subdirs = readdirSync(join(SKILLS_DIR, skill), { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);
    return walk(join(SKILLS_DIR, skill))
      .filter((path) => path.endsWith('.md'))
      .flatMap((path) =>
        findProblems({ skill, file: relative(SKILLS_DIR, path), text: readFileSync(path, 'utf8'), skillDirs, subdirs, exists }),
      );
  });
  return [...fileProblems, ...gateKeyProblems()];
}

function main() {
  const problems = checkRepo();
  if (problems.length > 0) {
    console.error(`Wiring check FAILED (${problems.length}):\n${problems.map((p) => `  - ${p}`).join('\n')}`);
    process.exit(1);
  }
  console.log('Wiring check passed: every skill handoff, bundled file and hook path resolves.');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
