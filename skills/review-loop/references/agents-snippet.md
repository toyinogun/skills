## Review loop
- Build any feature that has an approved spec in `docs/specs/` with `/review-loop <feature>`, not by running `/develop` and `/check` by hand.
- Features that touch money, auth, personal data, migrations or permissions: run `/risk-rate` first and `/fresh-eyes` before merge.
- When a review misses a bug or raises a false alarm, run `/review-rules learn <what happened>`.
- Every code review, including `/check review` and its reviewer, reads `REVIEW.md` first and applies its rules. Cite it when a finding comes from it.
