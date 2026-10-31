# Starting a fresh project

How a new project goes from an empty folder to features that build, verify and review themselves. Set up once, then repeat the feature loop.

## 1. Once per project

```mermaid
flowchart LR
    S1["Install skills<br/>restart"] --> S2["/scope"] --> S3["/architect<br/>the stack"] --> S4["/develop<br/>scaffold"] --> S5["/audit"] --> S6["/review-rules<br/>init"] --> S7["/review-loop<br/>setup<br/>restart"]
```

1. `npx skills@latest add toyinogun/skills -a claude-code`, then restart Claude Code.
2. `/scope` the idea and pick `Beta` or `GA` depth.
3. `/architect` the stack, then `/develop scaffold` to create the empty project.
4. `/audit` writes `AGENTS.md`; `/review-rules init` writes `REVIEW.md`.
5. `/review-loop setup`: approve the settings write, say yes to the `AGENTS.md` snippet, restart.

## 2. Each feature

```mermaid
flowchart TD
    F1["/architect feature<br/>spec with AC-1, AC-2, ..."] --> F2["Ask: build the feature<br/>or type /review-loop feature"]
    F2 --> F3[["/review-loop<br/>runs on its own, see 3"]]
    F3 -->|"passed"| A1["/fresh-eyes<br/>customer facing or high risk"]
    F3 -->|"stuck"| E1["You decide the next step"]
    A1 --> A2["/document"] --> A3["/sync, then /clear"]
    A3 -->|"next feature"| F1
    H1(["Hook: if the agent calls /develop,<br/>it is sent to /review-loop"]) -.-> F2
    B1(["Bug, anytime"]) --> B2["/debug"]
```

## 3. Inside `/review-loop`

```mermaid
flowchart TD
    L1["/risk-rate<br/>low, medium or high"] --> L2["/develop<br/>build or fix"]
    L2 --> L3["/check verify<br/>runs the app, ticks each AC<br/>only with evidence"]
    L3 --> L4["/check review<br/>different model, follows REVIEW.md"]
    L4 --> L5{"Every AC proven<br/>and no new findings?"}
    L5 -->|"yes"| P["status: passed"]
    L5 -->|"no, under 3 rounds"| L2
    L5 -->|"cap hit, or same<br/>problem after 2 fixes"| X["Escalate to you"]
    H2(["Hook: the agent cannot finish<br/>while any AC is unticked"]) -.-> L5
```

## What you type and what happens on its own

| You type | Happens on its own |
|---|---|
| The setup steps, once | `/develop` from the agent is routed into `/review-loop` |
| `/architect <feature>` for each feature | Risk rating, rounds, verify, review, round caps |
| "build X" or `/review-loop X` | "Done" is blocked until every criterion is ticked |
| `/fresh-eyes`, `/document`, `/sync` | Reviews apply `REVIEW.md` through the `AGENTS.md` snippet |

Shortcuts: a bug goes straight to `/debug`. A tiny throwaway change can be `/develop` typed by you, since typed commands are never redirected. To switch routing off on one machine, create `.review-loop/off`.

More on the loop itself: [review-loop.md](review-loop.md).
