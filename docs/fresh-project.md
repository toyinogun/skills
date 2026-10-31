# Starting a fresh project

How a new project goes from an empty folder to features that build, verify and review themselves. Set up once, then repeat the feature loop.

```mermaid
flowchart TD
    subgraph SETUP["1. One time setup"]
        direction TB
        S1["Install the skills<br/>npx skills add toyinogun/skills -a claude-code<br/>then restart Claude Code"]
        S2["/scope<br/>the product idea, features in order,<br/>pick Beta or GA depth"]
        S3["/architect<br/>decide the stack"]
        S4["/develop scaffold<br/>create the empty project"]
        S5["/audit<br/>write AGENTS.md from the real project"]
        S6["/review-rules init<br/>write REVIEW.md"]
        S7["/review-loop setup<br/>hooks, skill approvals, AGENTS.md snippet<br/>approve, then restart"]
        S1 --> S2 --> S3 --> S4 --> S5 --> S6 --> S7
    end

    subgraph FEATURE["2. Every feature"]
        direction TB
        F1["/architect feature<br/>spec with AC-1, AC-2, ..."]
        F2["Build it<br/>type /review-loop feature<br/>or just say: build the feature"]
        F1 --> F2
    end

    subgraph LOOP["/review-loop runs this on its own"]
        direction TB
        L1["/risk-rate<br/>low, medium or high"]
        L2["/develop<br/>build or fix this round"]
        L3["/check verify<br/>run the app, tick each AC<br/>only with evidence"]
        L4["/check review<br/>different model, follows REVIEW.md"]
        L5{"Every AC proven and<br/>no new findings?"}
        L6["status: passed"]
        L7["Escalate to you<br/>3 round cap, or the same<br/>problem survived 2 fixes"]
        L1 --> L2 --> L3 --> L4 --> L5
        L5 -->|"yes"| L6
        L5 -->|"no, under the cap"| L2
        L5 -->|"stuck"| L7
    end

    subgraph AFTER["3. Finish the feature"]
        direction TB
        A1["/fresh-eyes<br/>customer facing or high risk"]
        A2["/document<br/>PR text, changelog"]
        A3["/sync, then /clear"]
        A1 --> A2 --> A3
    end

    S7 --> F1
    F2 --> L1
    L6 --> A1
    A3 -->|"next feature"| F1

    H1(["Hook: the agent calls /develop<br/>on its own: sent to /review-loop"])
    H2(["Hook: cannot finish while<br/>any AC is unticked"])
    H1 -.-> F2
    H2 -.-> L5

    B1(["Something broke?"]) --> B2["/debug<br/>root cause, then a regression test"]
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
