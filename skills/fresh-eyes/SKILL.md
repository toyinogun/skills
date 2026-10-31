---
name: fresh-eyes
allowed-tools: Read, Write, Edit, Bash, Agent
argument-hint: <feature or flow to try>
description: "Run `/fresh-eyes` to send a tester agent that has never seen the code to use the live app like a first time customer and report where it got stuck. Run it after /check verify passes, to catch what the builders cannot see because they know how it works."
---

## Output style (plain words, no dashes, no hyphens)

<!-- OUTPUT-STYLE:START -->
Write everything this skill produces, files and messages alike, in plain simple language. Talk to the reader as `you`, warm and direct like a colleague, and present every step as a recommendation they may run or skip, never an order. Keep technical terms that carry real meaning; explain each in plain words. Never use a dash or a hyphen as punctuation: no em dash, no en dash, and no hyphenated compounds. Write `read only`, not `read-only`. Say it in simple words, or reword the sentence. Code, file paths, command flags, and values other skills match on keep their hyphens. Use short sentences, commas, or parentheses. Clear beats clever.
<!-- OUTPUT-STYLE:END -->

## What this skill does

The builders know how the app works, so they miss what a stranger hits. `/check verify` proves the specced behavior; this finds the confusion, dead ends and rough edges nobody specced. Read only on code, and it writes only under `.fresh-eyes/`.

## Asks vs acts

Acts. It asks once if the app has no safe way to run on throwaway data.

## Portability (any OS, any agent)

Any Agent Skills client. Without subagent support, say this test is weaker and ask the engineer to try the flow themselves from the brief.

## Execution

1. Write `.fresh-eyes/brief.md`: the app's public purpose in two sentences, how to start it, and the flow to try. Leave out anything about how it is built.
2. Start the app on a temporary database or seed data. Never point it at real data.
3. Create the empty file `.fresh-eyes/active`. While it exists, the optional hook below blocks source reads.
4. Spawn one fresh context subagent and set its model explicitly (a fast, low cost tier is enough; do not inherit the session model). Give it only `.fresh-eyes/brief.md` and tell it to:
   - use the app through the browser, `curl` or the CLI, like someone who has never seen it;
   - never read the repo's source, tests, docs or git history;
   - note every place it was confused, blocked or surprised, in order, with the exact step;
   - write its notes to `.fresh-eyes/report.md`.
5. When it finishes, delete `.fresh-eyes/active` and stop anything you started. Read the report, drop what is not reproducible, and print a ranked list with one suggested fix each.
6. Offer `/debug` for real failures and `/review-rules learn` for anything a review should have caught.

## Block source reads (Claude Code, once per project)

A subagent's tool list cannot always exclude `Bash`, so a hook adds a second lock. Offer to add this to `.claude/settings.json`:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Read|Grep|Glob|Bash",
        "hooks": [{ "type": "command", "command": "node .claude/skills/fresh-eyes/scripts/block-source-reads.mjs" }]
      }
    ]
  }
}
```

It is best effort, not a sandbox: an interpreter one liner can still read files, so tell the tester not to try. Add `.fresh-eyes/` to `.gitignore`.

Bundled files: `scripts/block-source-reads.mjs`.
