import test from 'node:test';
import assert from 'node:assert/strict';
import { decide } from '../skills/review-loop/scripts/route-to-loop.mjs';

const call = (skill, overrides = {}) =>
  decide({ skill, args: '', loopStatus: null, optedOut: false, ...overrides });

test('ignores skills other than develop', () => {
  for (const skill of ['check', 'architect', 'debug', 'review-loop', 'developer-tools']) {
    assert.equal(call(skill).action, 'allow', skill);
  }
});

test('denies develop when no review loop is running', () => {
  const out = call('develop');
  assert.equal(out.action, 'deny');
  assert.match(out.reason, /\/review-loop/);
});

test('denies a plugin namespaced develop too', () => {
  assert.equal(call('jsm:develop').action, 'deny');
});

test('allows develop when the review loop itself calls it', () => {
  assert.equal(call('develop', { loopStatus: 'running' }).action, 'allow');
});

test('still denies when the loop is paused or finished', () => {
  for (const loopStatus of ['waiting', 'passed', 'escalated', 'stopped']) {
    assert.equal(call('develop', { loopStatus }).action, 'deny', loopStatus);
  }
});

test('allows the project scaffold step', () => {
  assert.equal(call('develop', { args: 'scaffold the project' }).action, 'allow');
});

test('allows everything when the project opted out', () => {
  assert.equal(call('develop', { optedOut: true }).action, 'allow');
});
