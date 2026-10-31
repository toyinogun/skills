import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseFrontmatter,
  countOpenEvals,
  decide,
  MAX_BLOCKS,
} from '../skills/review-loop/scripts/eval-gate.mjs';

const stateFile = ({ status = 'running', evals = 'specs/auth/evals.md' } = {}) =>
  `---\nfeature: auth\nstatus: ${status}\nevals: ${evals}\n---\n# State\n`;

const evalsFile = (open, done) =>
  [
    ...Array.from({ length: open }, (_, i) => `- [ ] E${i + 1} still open`),
    ...Array.from({ length: done }, (_, i) => `- [x] D${i + 1} proven`),
  ].join('\n');

const reader = (files) => (path) => (path in files ? files[path] : null);

test('parseFrontmatter reads simple key value pairs', () => {
  assert.deepEqual(parseFrontmatter('---\na: 1\nb: two words\n---\nbody'), { a: '1', b: 'two words' });
  assert.deepEqual(parseFrontmatter('no frontmatter'), {});
});

test('countOpenEvals counts only unchecked boxes', () => {
  assert.equal(countOpenEvals(evalsFile(2, 3)), 2);
  assert.equal(countOpenEvals(evalsFile(0, 3)), 0);
});

test('allows when there is no loop state', () => {
  const out = decide({ readText: reader({}), blocks: 0 });
  assert.equal(out.action, 'allow');
});

test('allows when the loop is not running', () => {
  const files = { '.review-loop/state.md': stateFile({ status: 'passed' }), 'specs/auth/evals.md': evalsFile(2, 0) };
  assert.equal(decide({ readText: reader(files), blocks: 0 }).action, 'allow');
});

test('allows when every eval is checked', () => {
  const files = { '.review-loop/state.md': stateFile(), 'specs/auth/evals.md': evalsFile(0, 4) };
  assert.equal(decide({ readText: reader(files), blocks: 0 }).action, 'allow');
});

test('blocks while evals are open and counts the block', () => {
  const files = { '.review-loop/state.md': stateFile(), 'specs/auth/evals.md': evalsFile(2, 1) };
  const out = decide({ readText: reader(files), blocks: 0 });
  assert.equal(out.action, 'block');
  assert.equal(out.blocks, 1);
  assert.match(out.reason, /2 eval/);
});

test('releases the gate after MAX_BLOCKS so it cannot loop forever', () => {
  const files = { '.review-loop/state.md': stateFile(), 'specs/auth/evals.md': evalsFile(2, 0) };
  const out = decide({ readText: reader(files), blocks: MAX_BLOCKS });
  assert.equal(out.action, 'allow');
  assert.match(out.warning, /still open/);
});

test('blocks when the evals file is missing', () => {
  const files = { '.review-loop/state.md': stateFile() };
  const out = decide({ readText: reader(files), blocks: 0 });
  assert.equal(out.action, 'block');
  assert.match(out.reason, /evals file/i);
});

test('rejects an evals path that escapes the project', () => {
  const files = { '.review-loop/state.md': stateFile({ evals: '../../etc/passwd' }) };
  const out = decide({ readText: reader(files), blocks: 0 });
  assert.equal(out.action, 'block');
  assert.match(out.reason, /invalid evals path/i);
});
