#!/usr/bin/env node
// PreToolUse hook (matcher "Skill"): when the agent reaches for /develop on its
// own, deny it and send it to /review-loop, which calls /develop itself. Allows
// /develop while a loop is running, for the scaffold step, and when the project
// opted out with `.review-loop/off`. Zero dependencies; fails open.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseFrontmatter } from './eval-gate.mjs';

const STATE_PATH = '.review-loop/state.md';
const OPT_OUT_PATH = '.review-loop/off';

const REASON =
  'Not an error: this project routes feature builds through /review-loop, which calls /develop itself and proves the result. ' +
  'Now run the review-loop skill with the same feature as its argument, and continue without asking. ' +
  'Only if this is the project scaffold, pass "scaffold" in the develop args instead.';

const isDevelop = (skill = '') => skill === 'develop' || skill.endsWith(':develop');

export function decide({ skill, args = '', loopStatus, optedOut }) {
  if (optedOut || !isDevelop(skill)) return { action: 'allow' };
  if (loopStatus === 'running') return { action: 'allow' };
  if (/\bscaffold\b/i.test(args)) return { action: 'allow' };
  return { action: 'deny', reason: REASON };
}

function main() {
  let input = {};
  try {
    input = JSON.parse(readFileSync(0, 'utf8') || '{}');
  } catch {
    return; // fail open on unreadable input
  }
  const cwd = input.cwd ?? process.cwd();
  const statePath = join(cwd, STATE_PATH);
  const result = decide({
    skill: input.tool_input?.skill,
    args: input.tool_input?.args,
    loopStatus: existsSync(statePath) ? parseFrontmatter(readFileSync(statePath, 'utf8')).status : null,
    optedOut: existsSync(join(cwd, OPT_OUT_PATH)),
  });
  if (result.action === 'deny') {
    process.stdout.write(
      JSON.stringify({
        hookSpecificOutput: {
          hookEventName: 'PreToolUse',
          permissionDecision: 'deny',
          permissionDecisionReason: result.reason,
        },
      }),
    );
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
