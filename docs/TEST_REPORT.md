# Test execution report

Recorded 2026-10-15T08:59:46.640Z. Counts below refer to the final retained run, not accumulated reruns.

| Metric | Actual result |
| --- | --- |
| Parent states | 11 |
| Stored nuclear gamma lines | 667 |
| Eligible default-filter lines | 206 |
| Executed Vitest test files | 8 |
| Executed Vitest tests | 115 |
| Passed Vitest tests | 115 |
| Failed Vitest tests | 0 |
| Scientific/data-identity tests | 81 |
| Parser tests | 21 |
| React DOM tests | 13 |
| Additional independent calculation audit cases | 10 |
| Passed calculation audit cases | 10 |
| Configured real-browser cases | 18 |
| Executed real-browser cases | 0 |
| Real-browser cases not executed | 18 |
| Independent experimental identification validation | Not performed |
| Publication | Not performed |

## Executed files

| Executed file | Tests | Passed |
| --- | --- | --- |
| src/io/importPeaks.test.ts | 21 | 21 |
| src/physics/energyMatching.test.ts | 12 | 12 |
| src/physics/evidence.test.ts | 15 | 15 |
| src/physics/hypothesisComparison.test.ts | 9 | 9 |
| src/physics/identificationReport.test.ts | 25 | 25 |
| src/physics/referenceData.test.ts | 4 | 4 |
| src/physics/response.test.ts | 16 | 16 |
| src/test/App.test.tsx | 13 | 13 |

## Commands

| Command actually run | Exit code |
| --- | --- |
| npm ci | 0 |
| npm run validate:data | 0 |
| python3 scripts/import_iaea.py | 0 |
| npm test | 0 |
| npm run typecheck | 0 |
| npm run build | 0 |
| node scripts/check-standalone.mjs | 0 |
| npx playwright test --list | 0 |

## Additional verification

The data validator compared source SHA-256 values and every normalized line to its original source row. The importer reproduced normalized JSON, CSV and manifest byte for byte. Ten separate analytical audit cases passed, one per main function. The production standalone DOM check passed, including restricted file-origin preferences and Arabic RTL interaction. A generated sample PDF was inspected separately; real-browser download behavior remains unexecuted.

## Browser distinction

Playwright `--list` found 9 scenarios in each of two configurations (18 configured cases). It does not execute those cases. They remain NOT RUN. No browser pass rate or screenshot acceptance is reported. Responsive and RTL stylesheet behavior has source/DOM checks but no real-browser visual QA.

## Failure policy

Earlier development failures were corrected before this retained run. Zero failures refers to the executed final cases only. No statement that all requested browser verification passed is made. GitHub CI/Pages workflows are prepared but not remotely executed.
