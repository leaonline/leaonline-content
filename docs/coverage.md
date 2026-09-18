# Server test coverage

Run the production-only server report with:

```bash
./test.sh -a server -c -o
```

The command generates `.coverage/summary.txt` and `.coverage/lcov.info`, then
runs `npm run coverage:check`. The check fails if a test/helper source appears
in LCOV, an application JavaScript source is neither measured nor explicitly
classified, or an achieved metric falls below this ratchet:

| Metric | Minimum |
| --- | ---: |
| Statements | 93.19% |
| Branches | 88.47% |
| Functions | 86.81% |
| Lines | 93.43% |

## Source inventory

Three tracked JavaScript files are intentionally absent from the generated
LCOV inventory:

- `.settingsschema.js` is live startup validation code, but Meteor's coverage
  pipeline does not pass the root dotfile through Babel instrumentation. It is
  executed by `imports/startup/server/settingsSchema.js`; its absence is a
  known tooling limitation, not a dead-code classification.
- `imports/startup/server/token.js` defines an unfinished public method but is
  not imported by `server/main.js` or another startup module. It is currently
  unloaded/dead startup code.
- `queries/itemsList.js` contains comments only and has no executable code.

Files under `scripts/` are development tooling rather than Meteor runtime
sources. The coverage inventory covers root JavaScript plus the `imports/`,
`queries/`, and `server/` application trees.
