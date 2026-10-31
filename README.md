# Engineering Workflow Skills

A set of [Agent Skills](https://agentskills.io) that take a change from a vague idea to shipped, verified, documented code, for any AI coding agent. One skill per phase. Run only the ones a change needs, in any order.

The state lives in files (a scope, specs, AGENTS.md, tests), not in a chat session. So work survives across sessions, picks up where it left off, and works for a whole team.

```
idea → /scope → /audit → /architect → /develop → /check verify → /test → /check review → /document → /sync
```

Run `/debug` anytime something breaks. Run a bare `/scope` anytime to see where things stand.

For a feature that has to be right, swap the middle of that line for `/review-loop`, which chains `/develop`, `/check verify` and `/check review` in capped rounds. [Jump to the review loop](#the-review-loop-for-features-that-must-be-right).

> 📖 **Want the full picture?** Read the **[Workflow Guide](docs/workflow-guide.md)** — a plain-language walkthrough of every skill, the files that carry the work, who owns what, and one idea followed all the way from scope to shipped.

## The skills

| Skill | What it does |
|---|---|
| `scope` | Turns a product idea into a living, coarse scope and keeps it current as you ship. |
| `audit` | Writes the AGENTS.md context files every other skill reads. |
| `architect` | Makes a load bearing decision and writes it as a build spec in `docs/specs/`. |
| `develop` | Builds a feature, UI or backend, from its spec. Gates to `/architect` if a decision is owed. |
| `check` | Confirms a change before merge. `/check verify` runs the real app; `/check review` reads the code on a second model. |
| `test` | Writes a test suite for the code you just changed. |
| `document` | Writes the PR text, changelog, release note, or postmortem from the real diff. |
| `sync` | Keeps AGENTS.md, the scope, and spec statuses current after a change. |
| `debug` | Finds and fixes the root cause of a bug, then hands a regression test to `/test`. |
| `scroll-craft` | Builds a premium scroll driven landing page (by [Nate Herk](https://github.com/nateherkai/scroll-craft), MIT, vendored). `/develop` hands a scroll experience page to it and mounts the result; it can also run on its own. Needs Node 18, a full ffmpeg, and `playwright-core` (see its `SKILL.md`). |
| `review-loop` | Drives one feature through build, verify and review rounds by chaining `/develop`, `/check verify` and `/check review`, with round caps, a state file, and an optional Stop hook so "done" means every acceptance criterion is proven. |
| `risk-rate` | Rates one change low, medium or high by what happens to a customer if it breaks, and sets how often `/review-loop` reviews it. |
| `review-rules` | Creates `REVIEW.md` (what failure looks like here, what to ignore, the evidence rule) and grows it one approved rule at a time. |
| `fresh-eyes` | Sends a tester that has never seen the code to use the live app like a first time customer, after `/check verify` passes. |

Hardening (systems level failure mode analysis) is temporarily removed and will return as a system design specialization.

## Install

Uses [npx skills](https://github.com/vercel-labs/skills). Pick your agent:

```bash
# Claude Code (installs into .claude/skills, then restart Claude Code)
npx skills@latest add jsmastery-pro/skills -a claude-code

# Generic .agents/skills, read by Codex and other agents
npx skills@latest add jsmastery-pro/skills
```

Works on any Agent Skills client (Claude Code, Cursor, Codex, Gemini CLI, and [more](https://agentskills.io/clients)). Commit the installed skills folder to share the workflow with your team.

Each skill's instructions live in its `SKILL.md`, which is what every client reads. The `agents/openai.yaml` beside it is interface metadata only (the name, blurb, and opening prompt Codex shows in its agent picker); it carries no logic of its own.

## Where to start

**New product (greenfield):** see the step by step diagram in [docs/fresh-project.md](docs/fresh-project.md). In short: `/scope` the idea, then `/architect` the stack, then scaffold the project, then `/audit` to seed AGENTS.md from the real project, then the feature loop. The stack is decided and the project scaffolded before `/audit` runs, so it reads a real project, not an empty one.

**Existing codebase (brownfield):** `/audit` first so every skill understands your project, then `/scope` the next slice on top of what exists, then the feature loop.

**Any single change:** run only what it needs. A bug goes straight to `/debug`. A small change can be `/develop` then `/check verify`.

**A feature that must be right** (money, sign in, personal data, migrations, permissions): `/architect`, then `/review-loop <feature>`, then `/fresh-eyes`. See below.

**Monorepo:** everything scopes to the target workspace, which has its own AGENTS.md, scope, stack, and commands.

### The feature loop

```
/architect → /develop → /check verify → /test → /check review → /document → /sync
```

At the end of `/scope` you also pick a **workflow depth** for the project (override per feature anytime): `Prototype` (just `/develop`, self-checked, for throwaway work), `Alpha` (adds `/check verify`), `Beta` (adds `/test`), or `GA` (adds a fresh-model `/check review` and `/document`). The depth is a *suggested* checking tail after `/develop`, never a track you're locked onto: you're in charge, you run or skip any step and mark a feature `done` when you decide it is. The one thing the workflow asks — at every depth — is that a load-bearing decision gets written down (`/architect`), not that any check be run.

`/scope` fixes what to build. `/architect` designs how, as a spec whose acceptance criteria are the contract; every later step traces back to that contract. `/develop` gates on the spec: if building would mean inventing an undecided design, provider, or data model, it stops and routes you to `/architect`. You can override and build anyway, but the override is not free: the assumption is recorded as an `Assumed` spec in `docs/specs/` and flagged on the feature until `/architect` ratifies it. The flag doesn't block you from marking `done` — it's a standing reminder that a decision still owes ratification, so it never gets silently lost in chat.

The gate is layered, not magic: `/architect` names the source of every value a feature must produce (so gaps surface at design time), `/develop` checks that coverage again before building, and at Beta+ `/architect` recommends running an independent cross-model critic over the spec for decisions it never settled (you decide, and you decide on any gaps it finds). It's a strong, defense-in-depth gate that catches the vast majority — not an absolute guarantee, no prompt can be. Behavioral correctness is caught by the `/check verify` and `/test` layers.

### The review loop (for features that must be right)

```
/architect → /review-loop <feature> → /fresh-eyes → /document → /sync
                 │  each round: /develop → /check verify → /check review
                 ├─ /risk-rate    sets how often review runs
                 └─ /review-rules keeps REVIEW.md, the rules every review follows
```

Running `/develop`, `/check verify` and `/check review` by hand works, but it relies on you to notice a failed check, stop at the right time, and not repeat yourself. `/review-loop` does that bookkeeping:

- It copies the spec's `AC-N` lines into `.review-loop/criteria.md` and ticks one only when `/check verify` marks it met with cited evidence.
- It caps the loop at 3 rounds, asks for a rethink at the cap, and escalates to you if the same kind of finding survives 2 fix rounds.
- After round 1 it reviews only that round's changes and never counts a repeated finding as new.
- `/risk-rate` decides review cadence per change: `low` reviews once, `medium` every round, `high` every round plus a second opinion on a different model.
- An optional Stop hook stops the agent from finishing while criteria are unticked. It releases itself after 3 blocks, so it cannot trap a session.

Where it fits the workflow depths: `Prototype` and `Alpha` rarely need it. At `Beta` and `GA`, use it in place of running the build and check steps by hand, and add `/fresh-eyes` at `GA`.

**Making it automatic.** On its own, a skill runs only when you type it or when the agent matches your request to its description. In Claude Code, run this once per project to force the loop:

```
/review-loop setup
```

It wires three hooks into `.claude/settings.json`:

- **`route-to-loop`** (PreToolUse on `Skill`): when the agent reaches for `/develop` outside a running loop, the call is denied and the agent is sent to `/review-loop`, which calls `/develop` itself. The scaffold step and anything you type yourself still go through. Create `.review-loop/off` to switch it off on one machine.
- **`eval-gate`** (Stop): while a loop is running, the agent cannot finish until every criterion is ticked. It releases after 3 blocks so it cannot trap a session.
- **`block-source-reads`** (PreToolUse): keeps the `/fresh-eyes` tester away from the source.

Setup also offers this snippet (bundled as `skills/review-loop/references/agents-snippet.md`) for the project's root `AGENTS.md`, which steers the agent before any hook has to step in (other agents that read `AGENTS.md` follow it too):

```md
## Review loop
- Build any feature that has an approved spec in `docs/specs/` with `/review-loop <feature>`, not by running `/develop` and `/check` by hand.
- Features that touch money, auth, personal data, migrations or permissions: run `/risk-rate` first and `/fresh-eyes` before merge.
- When a review misses a bug or raises a false alarm, run `/review-rules learn <what happened>`.
- Every code review, including `/check review` and its reviewer, reads `REVIEW.md` first and applies its rules. Cite it when a finding comes from it.
```

What the hooks cannot catch: an agent that edits code directly without calling any skill. The `AGENTS.md` rule covers that case, and `/check review` will still see the diff. Details in [docs/review-loop.md](docs/review-loop.md).

## What gets written, and where

| Artifact | Path | Owner |
|---|---|---|
| Scope | `docs/scope/` | scope |
| Specs | `docs/specs/` | architect |
| Context files | AGENTS.md (plus a thin CLAUDE.md pointer) | audit, kept current by sync |
| Design system | `design.md` (art direction; token values live in CSS) | develop |
| Review findings | `docs/reviews/` | check |
| Review rules | `REVIEW.md` | review-rules |
| Loop state and criteria (ignored by git) | `.review-loop/` | review-loop |
| Stranger test brief and report (ignored by git) | `.fresh-eyes/` | fresh-eyes |
| Tests | your test dirs | test |
| App code | your source tree | develop |
| Human docs | PR body, CHANGELOG.md, `docs/releases/`, `docs/postmortems/` | document |

If `docs/` is a published docs site, these move to `.workflow/` so they do not ship with your site. Because state lives in files, each skill suggests `/clear` at handoffs, so a fresh session reads from disk again and long chats do not pile up cost.

## Skill reference

For each skill: what it does, and when to run it.

**scope**: Turns an idea into a living, coarse plan of what to build, in order.
When: to start a new product or plan the next slice. Greenfield: run it first. Brownfield: it enrolls what already exists, then plans the new work. Monorepo: writes one scope per workspace.

**audit**: Writes the AGENTS.md context files that give every skill your project's stack, commands, and conventions.
When: brownfield, run it first. Greenfield, run it after the stack is chosen and the project is scaffolded. Monorepo: gives each workspace its own nested AGENTS.md.

**architect**: Runs a deep design conversation and writes the decision as a build spec.
When: a load bearing choice is unmade (a stack, a data model, a provider, a page design), or `/develop` says a decision is owed. Greenfield: it decides the stack first. Monorepo: reads the target workspace's stack.

**develop**: Builds a feature, UI or backend, from its spec, runs migrations, and advances the scope.
When: after the decision exists. It gates to `/architect` if a design is owed. Monorepo: builds inside the target workspace using its commands.

**check**: Confirms a change before merge, in two modes.
When: `/check verify` after `/develop` to run the real app and prove the feature works against the spec; `/check review` before a PR for a senior review on a different model than wrote the code. Any project type.

**test**: Writes a senior test suite for your uncommitted change and saves your framework choice.
When: after building a feature or fixing a bug. Monorepo: resolves the framework per package.

**document**: Writes the human facing prose (PR, changelog, release note, postmortem) from the real diff.
When: a finished change needs writing up. Any project type.

**scroll-craft**: Interviews you, picks a page grammar and a signature move, builds real HTML on its scroll engine, and verifies the page by screenshotting its own scroll.
When: a web marketing, launch, brand, or portfolio page that should feel like an experience. `/architect` records it as the design source and `/develop` invokes it (`ui/scroll-craft.md`); or run `/scroll-craft` directly.

**sync**: Reconciles AGENTS.md, the scope, and spec statuses to what the repo now shows.
When: the last step around merge. Monorepo: reconciles the right workspace.

**debug**: Runs a disciplined root cause loop and hands a regression test to `/test`.
When: anytime something is failing, throwing, or behaving wrong. Not tied to project type.

**review-loop**: Drives one feature through build, verify and review rounds by chaining `/develop`, `/check verify` and `/check review`, with round caps and a state file.
When: a feature has an approved spec and must be right, instead of running those steps by hand. Needs a spec with `AC-N` criteria. Optional Stop hook makes "done" enforceable.

**risk-rate**: Rates one change low, medium or high by what happens to a customer if it breaks.
When: `/review-loop` runs it for you. Run it alone when you wonder how careful to be.

**review-rules**: Creates `REVIEW.md` and grows it one approved rule at a time.
When: `init` once per repo; `learn` after a review missed a bug or raised a false alarm.

**fresh-eyes**: Sends a tester that has never seen the code through the live app and reports where it got stuck.
When: after `/check verify` passes, on features a real customer will meet first.

## Learn more

The **[Workflow Guide](docs/workflow-guide.md)** is the deep dive: how the scope, specs, AGENTS.md, and design system live and who is allowed to change them; the acceptance-criteria thread that ties every stage together; a full worked example from idea to shipped; the debug loop; and how the same flow runs on an existing codebase and in a monorepo.

---

Built with the [Agent Skills](https://agentskills.io) open format.
