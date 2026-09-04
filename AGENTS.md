# MEIMI&H Internal Quotation Workbench

## Project Skill Rules

Use the project's installed skills automatically when their scope matches the task:

- `impeccable`: UI/UX work on the internal workbench, including layout, hierarchy, accessibility, responsive behavior, copy, states, and interaction polish. Read the project product/design context before editing UI and run its detector after UI changes.
- `mono-color`: visual direction for generated or edited raster assets, and as a restrained reference for palette, ink roles, contrast, and negative space when shaping the workbench. Do not turn the internal tool into a poster or apply image-generation rules to ordinary CSS UI.
- `tdd`: use a red-green-refactor loop when adding a testable feature or fixing a behavior bug; test public seams rather than implementation details.
- `diagnosing-bugs`: use the diagnosis loop for reported failures, broken clicks, sync errors, regressions, or performance problems.
- `code-review`: use for review requests or before shipping a substantial change; keep standards and specification findings separate.
- `grill-me`: use when the user asks to quiz, verify, or refresh understanding of this codebase.
- `setup-matt-pocock-skills`: keep the repository engineering context and issue-tracker configuration current when the engineering skill set needs setup changes.

## Default Delivery Loop

1. Read the relevant code, project context, and current uncommitted changes.
2. Keep the public independent site isolated from `/admin` internal-workbench changes.
3. Make the smallest complete change that improves the user's workflow.
4. Verify with focused checks, then run `npm run lint`, `npx tsc --noEmit`, and `npm run build` when code or styles change.
5. Report deployment status separately from local and GitHub status; never claim Vercel is live without checking the deployed URL.

## Product Boundary

This repository contains both the public MEIMI&H site and the internal employee quotation workbench. The public site must remain a separate experience. Internal customer data, pricing rules, product maintenance, staff accounts, and `/admin` behavior must not be exposed through public routes.
