# Changelog

## 1.0.0 - 2026-10-15

Initial independent release candidate for scientific and browser review.

- Added ten distinct identification/evidence functions and fifteen UI pages.
- Added a traceable 11-parent-state, 667-transition IAEA LiveChart / ENSDF
  library, exact raw CSV snapshots, source hashes and offline import scripts.
- Added uncertainty-aware energy matching, common calibration covariance,
  overlap-aware independent assignments, explicit ambiguity and alternatives.
- Added detector-weighted ratios and conservative conditional missing-line
  diagnostics that withhold results when their required information is absent.
- Added bounded mixture cover and an explicitly defined conditional centroid
  likelihood with shared calibration integration and inconclusive status.
- Added English/Arabic RTL, light/dark themes, responsive styling and SVG charts.
- Added frozen-snapshot PDF/CSV/JSON and PNG export controls, provenance labels,
  stale-result protection and automatic removal of simulated response on new
  user measurements.
- Added a modular production build and a self-contained direct-open HTML build.
- Added analytical/scientific, parser and React DOM tests, source-data checks,
  standalone bundle checks and configured desktop/mobile Playwright scenarios.
- Added manual-only GitHub Pages workflow requiring explicit approval input.
- Documented the unexecuted real-browser checks, absence of experimental
  calibration and remaining model/source/covariance limitations.
