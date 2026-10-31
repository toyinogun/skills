#!/usr/bin/env node
// Stop hook: stop the agent from finishing while a review loop is running and
// evals are still unchecked. Zero dependencies. Wire it in .claude/settings.json
// (see ../SKILL.md). Releases itself after MAX_BLOCKS so it can never trap a session.
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, isAbsolute, join } from 'node:path';
import { pathToFileURL } from 'node:url';

export const MAX_BLOCKS = 3;
const STATE_PATH = '.review-loop/state.md';
const COUNT_PATH = '.review-loop/gate-count';

export function parseFrontmatter(text) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text);
  if (!match) return {};
  const pairs = match[1]
    .split(/\r?\n/)
    .map((line) => /^([\w-]+):\s*(.*)$/.exec(line))
    .filter(Boolean)
    .map(([, key, value]) => [key, value.trim()]);
  return Object.fromEntries(pairs);
}

export function countOpenEvals(text) {
  return (text.match(/^\s*- \[ \] /gm) ?? []).length;
}

const isSafeRelativePath = (path) =>
  Boolean(path) && !isAbsolute(path) && !path.split(/[\\/]/).includes('..');

const block = (reason, blocks) => ({ action: 'block', reason, blocks: blocks + 1 });
const allow = (extra = {}) => ({ action: 'allow', blocks: 0, ...extra });

/** Pure decision. `readText(relPath)` returns file text or null. */
export function decide({ readText, blocks }) {
  const state = readText(STATE_PATH);
  if (state === null) return allow();

  const meta = parseFrontmatter(state);
  if (meta.status !== 'running') return allow();

  if (!isSafeRelativePath(meta.evals)) {
    return block(`Invalid evals path in ${STATE_PATH} while the review loop is running. Fix it or set status to stopped.`, blocks);
  }

  const evals = readText(meta.evals);
  if (evals === null) {
    return block(`Review loop is running but the evals file ${meta.evals} is missing. Restore it or set status to stopped.`, blocks);
  }

  const open = countOpenEvals(evals);
  if (open === 0) return allow();

  if (blocks >= MAX_BLOCKS) {
    return allow({ warning: `Gate released after ${MAX_BLOCKS} blocks with ${open} eval(s) still open. Do not report this as done.` });
  }
  return block(
    `Not done: ${open} eval(s) in ${meta.evals} are still open. Finish the review loop (or set status to escalated or stopped in ${STATE_PATH} and tell the user why) before stopping.`,
    blocks,
  );
}

function readTextFrom(cwd) {
  return (relPath) => {
    const full = join(cwd, relPath);
    return existsSync(full) ? readFileSync(full, 'utf8') : null;
  };
}

function main() {
  let input = {};
  try {
    input = JSON.parse(readFileSync(0, 'utf8') || '{}');
  } catch {
    // No usable stdin: fall through with defaults and fail open.
  }
  const cwd = input.cwd ?? process.cwd();
  const countFile = join(cwd, COUNT_PATH);
  const blocks = existsSync(countFile) ? Number.parseInt(readFileSync(countFile, 'utf8'), 10) || 0 : 0;

  const result = decide({ readText: readTextFrom(cwd), blocks });

  if (result.action === 'block') {
    mkdirSync(dirname(countFile), { recursive: true });
    writeFileSync(countFile, String(result.blocks));
    process.stdout.write(JSON.stringify({ decision: 'block', reason: result.reason }));
    return;
  }
  if (existsSync(countFile)) rmSync(countFile);
  if (result.warning) process.stdout.write(JSON.stringify({ systemMessage: result.warning }));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
