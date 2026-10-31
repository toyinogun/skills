# Starting a fresh project

How a new project goes from an empty folder to features that build, verify and review themselves. Set up once, then repeat the feature loop.

```mermaid
flowchart LR
    subgraph SETUP["1 · Once per project"]
        direction TB
        S1["Install skills<br/>+ restart"] --> S2["/scope"] --> S3["/architect<br/>stack"] --> S4["/develop<br/>scaffold"] --> S5["/audit"] --> S6["/review-rules init"] --> S7["/review-loop setup<br/>+ restart"]
    end

    subgraph FEATURE["2 · Each feature"]
        direction TB
        F1["/architect feature<br/>spec with AC-1, AC-2"] --> F2["build the feature<br/>or /review-loop feature"]
    end

    subgraph LOOP["3 · /review-loop, automatic"]
        direction TB
        L1["/risk-rate"] --> L2["/develop"] --> L3["/check verify<br/>tick ACs with evidence"] --> L4["/check review<br/>other model + REVIEW.md"] --> L5{"all ACs proven,<br/>no new findings?"}
        L5 -->|"no, under cap"| L2
        L5 -->|"stuck"| L7["escalate to you"]
        L5 -->|"yes"| L6["passed"]
    end

    subgraph AFTER["4 · Finish"]
        direction TB
        A1["/fresh-eyes<br/>if customer facing or high risk"] --> A2["/document"] --> A3["/sync, /clear"]
    end

    S7 --> F1
    F2 --> L1
    L6 --> A1
    A3 -->|"next feature"| F1

    H1(["hook: agent's /develop<br/>is sent to /review-loop"]) -.-> F2
    H2(["hook: can't finish<br/>while an AC is open"]) -.-> L5
    B1(["bug, anytime"]) --> B2["/debug"]
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
