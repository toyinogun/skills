import test from 'node:test';
import assert from 'node:assert/strict';
import { decide } from '../skills/fresh-eyes/scripts/block-source-reads.mjs';

const call = (toolName, toolInput, active = true) => decide({ active, toolName, toolInput });

test('allows everything when no fresh eyes run is active', () => {
  assert.equal(call('Read', { file_path: 'src/app.ts' }, false).action, 'allow');
  assert.equal(call('Bash', { command: 'cat src/app.ts' }, false).action, 'allow');
});

test('denies Read, Grep and Glob outside the report folder', () => {
  assert.equal(call('Read', { file_path: 'src/app.ts' }).action, 'deny');
  assert.equal(call('Grep', { pattern: 'password' }).action, 'deny');
  assert.equal(call('Glob', { pattern: 'src/**/*.ts' }).action, 'deny');
});

test('allows reading the report folder', () => {
  assert.equal(call('Read', { file_path: '.fresh-eyes/brief.md' }).action, 'allow');
});

test('denies shell commands that read source', () => {
  for (const command of ['cat src/a.ts', 'head -n 5 a.ts', 'grep -r token .', 'rg secret', 'git diff', 'git show HEAD', 'ls && cat a.ts']) {
    assert.equal(call('Bash', { command }).action, 'deny', command);
  }
});

test('allows shell commands that only run or visit the app', () => {
  for (const command of ['npm run dev', 'curl http://localhost:3000/', 'pnpm test', 'sleep 2']) {
    assert.equal(call('Bash', { command }).action, 'allow', command);
  }
});

test('ignores tools it does not govern', () => {
  assert.equal(call('Write', { file_path: '.fresh-eyes/report.md' }).action, 'allow');
});

test('deny carries a reason the agent can act on', () => {
  assert.match(call('Read', { file_path: 'src/x.ts' }).reason, /fresh eyes/i);
});
