---
name: review-loop
allowed-tools: Bash, Read, Grep, Glob, Write, Edit, Skill
argument-hint: <feature>
description: "Run `/review-loop` to drive one feature through build, verify and review rounds until every acceptance criterion is proven and the review finds nothing new, with round caps so it cannot spin. It chains /develop, /check verify and /check review. Run it after /architect, instead of calling them by hand."
---

## Output style (plain words, no dashes, no hyphens)

<!-- OUTPUT-STYLE:START -->
Write everything this skill produces, files and messages alike, in plain simple language. Talk to the reader as `you`, warm and direct like a colleague, and present every step as a recommendation they may run or skip, never an order. Keep technical terms that carry real meaning; explain each in plain words. Never use a dash or a hyphen as punctuation: no em dash, no en dash, and no hyphenated compounds. Write `read only`, not `read-only`. Say it in simple words, or reword the sentence. Code, file paths, command flags, and values other skills match on keep their hyphens. Use short sentences, commas, or parentheses. Clear beats clever.
<!-- OUTPUT-STYLE:END -->

## What this skill does

The loop around your other skills. It builds nothing, verifies nothing and reviews nothing itself. It runs `/develop`, `/check verify` and `/check review` in rounds, keeps one state file, stops the loop from spinning, and makes "done" something a hook can enforce. Every claim it records comes from those skills' own reports.

## Asks vs acts

Acts. It asks only when a round hits a decision the spec did not settle, when `/check verify` comes back BLOCKED, or when it escalates.

## Artifact ownership

- `.review-loop/state.md`, `.review-loop/criteria.md` and `.review-loop/round-<n>/`: created and edited by this skill only. Add `.review-loop/` to `.gitignore`.
- Never edits specs, the scope, `verify.md` or `docs/reviews/`. Those belong to `/architect`, `/develop` and `/check`.

## Portability (any OS, any agent)

Any Agent Skills client. Where a client cannot run another skill by name, tell the engineer which command to run at each step and read its report back from them. Hooks below are Claude Code only; the loop works without them.

## Execution

### Step 0: Preconditions (stop if one fails)

- A spec with IDed acceptance criteria (`AC-1`, `AC-2`, ...) exists for the feature. None found: route to `/architect` and stop.
- `REVIEW.md` exists at the repo root. Missing: offer `/review-rules init` once, then continue if declined.

### Step 1: Start the state

1. Create `.review-loop/state.md` from `references/state-template.md`: `status: running`, `round: 1`, `max_rounds: 3`, `criteria: .review-loop/criteria.md`.
2. Copy every `AC-N` line from the spec into `.review-loop/criteria.md` as `- [ ] AC-N <text>`. Do not touch the spec.
3. Run `/risk-rate` and record `risk:` in the state. It decides how often review runs (Step 3).

### Step 2: Build or fix

- Round 1: run `/develop <feature>`.
- Later rounds: run `/develop <feature>` and tell it to fix only the open items in `.review-loop/round-<n>/open.md`. Fix every place with the same finding `class`, not only the flagged line. A failure with an unclear cause goes to `/debug` first.
- Leave the round's changes uncommitted until Step 4 has run.

### Step 3: Verify

Run `/check verify <feature>`. Read its verdict and per criterion results.

- Tick `- [x] AC-N` in `criteria.md` only for a criterion that report marks met with cited evidence. Everything else stays open.
- BLOCKED: set `status: waiting`, say what `/check verify` needs, and stop until the engineer answers.
- Save the open criteria and failures to `.review-loop/round-<n>/open.md`.

### Step 4: Review

By risk tier from Step 1:

- `low`: run `/check review` once, when verify first passes.
- `medium`: run `/check review` every round.
- `high`: every round, and at the end ask the engineer to rerun it on a different model for a second opinion.

Round 1 reviews everything. Later rounds run `/check review uncommitted`, so only that round's changes are read. Tell it to follow `REVIEW.md`. Commit the round after the review ran, if the engineer wants commits.

From the relayed findings, record each blocker and major in the state table with a short `class` (for example `missing-auth-check`, `unescaped-output`) and its `file:line`. A finding already in the table is not new, whatever its wording. A finding with no `file:line` is dropped.

### Step 5: Decide

- Every criterion ticked and no new blocker or major: `status: passed`. Go to Finish.
- `round` equals `max_rounds`: ask `/check review` for no new findings, say in two sentences why this approach keeps failing and what to try instead, and run one more round. Still failing: `status: escalated`.
- Any finding `class` still open after 2 fix rounds: `status: escalated`.
- A decision only the engineer can make: `status: waiting`, print a short progress report, ask, resume on the answer.
- Otherwise `round + 1` and back to Step 2.

Use `max_rounds: 5` only when each round also exercises the app in a browser, and say so.

### Finish

Print, in this order: open criteria and finding counts, rounds used, final `status`, then a block for the PR:

```
Testing: <criteria proven, where the evidence is>
Risk: <tier and why>
How to revert: <flag, commit or migration step>
```

If a finding class repeated across rounds, suggest `/review-rules learn <class>`. Do not mark the feature `done`; `/check verify` already offers that. On escalation, set `status: escalated`, list what is still open, and hand the decision to the engineer. If they abandon the loop, set `status: stopped`.

## Make "done" enforceable (Claude Code, once per project)

Offer to add this Stop hook to `.claude/settings.json`. It blocks the agent from finishing while criteria are open and releases itself after 3 blocks:

```json
{
  "hooks": {
    "Stop": [
      { "hooks": [{ "type": "command", "command": "node .claude/skills/review-loop/scripts/eval-gate.mjs" }] }
    ]
  }
}
```

Adjust the path if the skills live elsewhere.

## Rules

- Only a `/check verify` report ticks a criterion. This skill never ticks one from reading code.
- Never edit the spec to make a criterion pass. A wrong criterion goes back to `/architect`.
- Never rerun a round without recording it in the state first.

Bundled files: `references/state-template.md`, `scripts/eval-gate.mjs`.
