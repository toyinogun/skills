---
name: risk-rate
allowed-tools: Read, Grep, Glob, Edit
argument-hint: <feature or change>
description: "Run `/risk-rate` to rate one change low, medium or high risk by asking what happens to a customer if it breaks, and to learn how often it should be reviewed. Run it from `/review-loop`, or any time you wonder how careful to be with a change."
---

## Output style (plain words, no dashes, no hyphens)

<!-- OUTPUT-STYLE:START -->
Write everything this skill produces, files and messages alike, in plain simple language. Talk to the reader as `you`, warm and direct like a colleague, and present every step as a recommendation they may run or skip, never an order. Keep technical terms that carry real meaning; explain each in plain words. Never use a dash or a hyphen as punctuation: no em dash, no en dash, and no hyphenated compounds. Write `read only`, not `read-only`. Say it in simple words, or reword the sentence. Code, file paths, command flags, and values other skills match on keep their hyphens. Use short sentences, commas, or parentheses. Clear beats clever.
<!-- OUTPUT-STYLE:END -->

## What this skill does

Rates the change, never the author. One question decides it: what happens to a customer if this breaks? It is separate from the workflow tier (`Prototype` to `GA`), which is chosen for a whole project. This rating is per change, so a small edit to billing can be `high` in a `Prototype` project.

## Artifact ownership

Prints the rating. When `.review-loop/state.md` exists, it writes `risk:` there and nowhere else. It never edits a spec or the scope.

## Execution

### Tiers

| Tier | If it breaks | Review cadence in `/review-loop` |
|---|---|---|
| `low` | It looks wrong, or the change is internal, or additive behind a flag | `/check review` once, after verify first passes |
| `medium` | A feature stops working but nobody loses anything and a later fix is fine | `/check review` every round |
| `high` | Someone loses money, is locked out, sees another person's data, or the damage cannot be undone | Every round, plus a second opinion on a different model before merge |

### Steps

1. Read the spec or the diff. If the target is vague, ask one question to pin it down.
2. Raise to `high` for any change that touches auth or sessions, payments or billing, personal data, migrations or deletes, permissions, CI or release workflows, installers or updaters, or secrets, whatever its size.
3. Pick the tier on the worst realistic failure, not the likely one. When two tiers fit, take the higher. Lower it only if the engineer says so.
4. Print the tier, one line of reason, and its row from the table. Record it as above.

Never say a tier makes human review optional. State what the tier asks for and let the engineer decide.
