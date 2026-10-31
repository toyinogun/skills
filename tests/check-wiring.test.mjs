import test from 'node:test';
import assert from 'node:assert/strict';
import { findProblems, checkRepo } from '../scripts/check-wiring.mjs';

const skillDirs = ['develop', 'review-loop'];
const subdirs = { develop: ['modes'], 'review-loop': ['scripts', 'references'] };
const files = new Set(['develop/modes/build.md', 'review-loop/scripts/eval-gate.mjs']);
const scan = (skill, text) =>
  findProblems({ skill, file: `${skill}/SKILL.md`, text, skillDirs, subdirs: subdirs[skill], exists: (p) => files.has(p) });

test('passes a bundled path that exists', () => {
  assert.deepEqual(scan('develop', 'Read `modes/build.md` first.'), []);
});

test('flags a bundled path that does not exist', () => {
  assert.match(scan('develop', 'Read `modes/missing.md`.').join(), /modes\/missing\.md/);
});

test('ignores project paths that are not bundled folders', () => {
  assert.deepEqual(scan('develop', 'Write `docs/specs/x.md` and `.review-loop/state.md`.'), []);
});

test('flags a backticked command for a skill that does not exist', () => {
  assert.match(scan('develop', 'Then run `/deploy now`.').join(), /\/deploy/);
});

test('accepts commands for real skills and agent built ins', () => {
  assert.deepEqual(scan('develop', 'Run `/review-loop x`, then `/clear`, `/model`, `/compact`.'), []);
});

test('ignores app routes and text after a closing backtick', () => {
  assert.deepEqual(scan('develop', 'Visit `/signup` and check `design.md`/the design file.'), []);
});

test('flags a hook command that points at a missing script', () => {
  const text = '"command": "node .claude/skills/review-loop/scripts/gone.mjs"';
  assert.match(scan('review-loop', text).join(), /gone\.mjs/);
});

test('passes a hook command that points at a real script', () => {
  const text = '"command": "node .claude/skills/review-loop/scripts/eval-gate.mjs"';
  assert.deepEqual(scan('review-loop', text), []);
});

test('the real repo is fully wired', () => {
  assert.deepEqual(checkRepo(), []);
});
