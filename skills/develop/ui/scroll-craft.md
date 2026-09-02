# UI Source: scroll experience (hand off to `scroll-craft`)

This is case 5 from the guide: the page is a scroll driven experience (a landing, launch, brand, or portfolio page that should feel like a film rather than a document). `/develop` does not design it. The sibling `scroll-craft` skill does: it interviews, picks a page grammar, builds real HTML on its own engine, and verifies the page by screenshotting its own scroll. `/develop` stays the owner of the project, the spec, and the scope; `scroll-craft` owns the page.

## When this route applies

- The spec records the design source as `scroll-craft`, or asks for scrollytelling, scroll animation, a video that scrubs under the wheel, an "Apple style" page, or a page that must "feel like an experience".
- The task is a whole page, not a component. A component, a dashboard, a form, or an app screen never takes this route; use `ui/generate.md` or `ui/existing.md`.
- The page is web. `scroll-craft` builds HTML plus its own JS and CSS engine, so a native mobile or desktop UI never takes this route.

Any doubt → ask once: *"Should this page be a scroll experience (built by `scroll-craft`), or a standard product page?"* Recommend `scroll-craft` only for marketing and brand pages.

## Step 1: Hand off

1. Read `flow/build.md` Step 2 first, so you carry the spec, the acceptance criteria, the nearest `AGENTS.md`, and any brand assets or `design.md` into the handoff.
2. Invoke the `scroll-craft` skill (Claude Code: the Skill tool, `/scroll-craft`; another client: read `../../scroll-craft/SKILL.md`, the sibling skill folder, and follow it as if invoked). Open with the context it needs, in one message: the feature, the acceptance criteria verbatim, the brand kit or `design.md` path if one exists, the assets the repo already holds, and the target route or path in this project.
3. Let it run its own procedure end to end (interview, brief, grammar, build, verify). Do not shortcut its interview and do not edit its engine. It writes into its workspace (`<workspace>/builds/<name>/`, resolved by its `scripts/workspace.mjs`).

Assets: `scroll-craft` can generate footage through kie.ai (needs `KIE_AI_API_KEY`, costs money) or build from the user's own photos and clips at no cost. Never set the key or spend on the engineer's behalf; surface the choice and let them pick.

## Step 2: Integrate into the project

`scroll-craft` produces a standalone build folder. Bring it into the project the project's way:

- Static site or plain HTML → copy the build folder (page, `engine/`, encoded assets) to the route's public path.
- A framework app (Next.js, Astro, Vite, and so on) → mount the page at the target route: serve the HTML as a static route, or port the markup into the framework's page file with the engine's CSS and JS loaded as static assets and the `data-sc-*` attributes kept verbatim. Keep the engine files untouched and under the project's static folder.
- Fonts and the six colour tokens stay where `scroll-craft` put them (its `:root` overrides). Do not fold them into `design.md`; note in `design.md` that this route is a `scroll-craft` build and point at its `BRIEF.md`.

Then run `checklist.md` (accessibility) against the mounted page. `scroll-craft` already covers contrast, reduced motion, and focus order; you cover what mounting can change (the head, the route shell, the nav link into the page).

## Step 3: Report

Use the normal `## /develop complete` block from `ui/implementation.md`. Add one line each for: the build folder path and its `BRIEF.md`, the grammar and signature move `scroll-craft` chose, what its harness verified (the contact sheet path), and what it could not verify (a real phone). The `scroll-craft` report itself lives in its build folder, not in yours.
