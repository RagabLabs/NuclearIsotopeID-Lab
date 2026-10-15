# Nuclear Isotope Identification Lab v1.0.0

A standalone, research-oriented gamma-ray isotope identification application.
React + TypeScript + Vite. All analysis runs locally in the browser. No API key,
server-side measurement upload, AI-generated isotope names, or account is needed.

> This application provides research-oriented gamma-ray isotope identification support. Candidate identifications are not definitive without suitable measurement quality, calibrated detector response, validated analysis methods, and expert review.

## Open the application

**Simplest:** open `dist/NuclearIsotopeID-Lab.html` in a modern browser. This is
a self-contained production bundle with its code, styling and reference data
included. Browser download policies can differ for local files; hosted use is
recommended if a browser restricts a PDF/CSV/PNG download.

**Develop / serve the modular build:** install Node.js 24, then run:

```bash
npm ci
npm run dev
```

For a production preview:

```bash
npm run build
npm run preview
```

The modular `dist/index.html` should be served over HTTP. The separately bundled
`dist/NuclearIsotopeID-Lab.html` is the direct-open version. Do not open the
source root `index.html` as a local file.

## Included features

Fifteen pages provide a complete identification workspace, ten independent
analysis tools, a reference library, scientific documentation, Home and About.
English is the default UI; Arabic RTL, light and dark themes are available.
Measured peak stems are interactive and clearly distinguished from reference
lines. They are a peak-list visualization, **not** a reconstructed raw spectrum.

| # | Function | Distinct primary output |
| --- | --- | --- |
| 01 | Gamma energy line matching | Compatible lines, energy differences and justified residuals |
| 02 | Candidate ranking | Independent-support evidence points with an explicit rule |
| 03 | Multi-line consistency | Centroid chi-square using a shared calibration covariance |
| 04 | Missing expected lines | Conditional sensitivity-aware line-visibility assessment |
| 05 | Shared-line ambiguity | Alternative parent assignments and discriminating lines |
| 06 | Relative intensity consistency | Efficiency-corrected ratios and diagnostic log residuals |
| 07 | Mixed-isotope attribution | Bounded component subsets and shared peak assignments |
| 08 | Evidence coverage | Separate peak, group, weight and listed-area fractions |
| 09 | Alternative hypotheses | Explicit conditional energy-centroid likelihood comparison |
| 10 | Evidence report | Synthesis of supporting, contradictory and limiting evidence |

## Reference coverage and provenance

The bundled IAEA LiveChart / ENSDF subset has **11 parent states and 667 nuclear
gamma transitions**, between 20 and 3500 keV. The default probability filter
keeps 206 transitions; lowering it exposes weaker lines and more ambiguity.
The 11 states are Co-60, Cs-137, Na-22, Eu-152, Ba-133, Am-241, I-131, Tc-99m,
K-40, Bi-214 and Pb-214. This is not a complete nuclide database.

Raw CSV responses, SHA-256 hashes, source row numbers, parent-state selection,
daughter, transition levels, absolute photon yield, uncertainties, evaluation
cutoffs and source URLs are retained. The API guide describes an April 2022
ENSDF snapshot; the actual retrieval was 2026-10-14. A retrieval date does not
imply a new evaluation. See `docs/REFERENCE_DATA.md` and `NOTICE.md`.

511 keV annihilation photons and atomic X rays are deliberately excluded. The
API can append atomic radiation rows even to a gamma query; the importer
requires nuclear transition levels and the intended parent state.

## Import measurements

Use CSV, TSV or JSON, up to 2 MB / 200 peaks. Only peak energy is required.
Generic energy columns use the unit selector; explicit unit headers override
it. Uncertainty and FWHM columns also honor their explicit units.

```csv
energy_keV,energy_uncertainty_keV,net_peak_area,peak_area_uncertainty,fwhm_keV,measurement_time_s,detector_id
1173.228,0.10,3994,65,2.0,600,HPGe-A
1332.492,0.10,3499,60,2.1,600,HPGe-A
```

These example values are illustrative simulated measurements, not experimental
validation. Example files are in `public/examples/`. The example detector curve
is also simulated. **The first measurement edit or import clears the simulated
response and assessed-uncertainty assumptions.** Supply your own response model
before interpreting relative intensities or missing lines quantitatively.

JSON accepts an array, or `{ "energyUnit":"keV", "peaks":[...] }`. Recognized
fields and aliases are documented in `docs/USER_GUIDE.md`. Raw channel spectra
are not accepted: import a calibrated peak list from your spectrum-analysis
software. Calibration, FWHM measurement and peak integration are not duplicated
as main tools.

## Uncertainty and response controls

Centroid standard uncertainty, reference energy uncertainty, and an explicitly
assessed calibration uncertainty are required for total-energy z residuals.
When missing, the app uses the displayed energy-dependent fallback window and
withholds the statistical residual. An entered zero is not treated as a known
calibration uncertainty until its assessment checkbox is enabled.

For quantitative intensity or missing-line diagnostics, provide full-energy
peak efficiencies, their uncertainties, explicit coincidence-summing treatment,
and an additional relative uncertainty for the response ratio model. Enter
zero for that last quantity only if it has been explicitly assessed negligible.
A complete peak list and an external validated count threshold are additionally
required to use unobserved lines as conditional contradictory evidence.

The app never interprets an evidence score or coverage percentage as a
probability. A single line remains tentative or ambiguous. No activities,
concentrations, dose rates, chain equilibrium or absence of nuclides are inferred.

## Exports

- PDF: complete English analytical report, paginated, generated from the frozen
  analysis snapshot. All candidates, compatible lines, missing-line states,
  intensity diagnostics, alternatives, inputs, settings, limits and sources are
  included.
- CSV: section-tagged audit records; no source tables or results are silently
  discarded. JSON: the complete reproducible analysis object.
- PNG: the main spectrum and numerical comparison charts. Use the chart button
  or the tool-page PNG control.

Edits mark results stale and disable exports until analysis succeeds again.
A previous result is never relabelled as a result of failed new input.

## Verification

```bash
npm ci
npm run validate:data
npm test
npm run typecheck
npm run build
node scripts/check-standalone.mjs
```

For actual browser tests in an environment that supports Chromium:

```bash
npx playwright install --with-deps chromium
npm run test:e2e
```

The delivery report distinguishes executed Vitest/jsdom checks from unexecuted
Playwright checks. jsdom does **not** validate real layout, browser downloads,
mobile rendering or PNG rasterization. No independent experimental campaign
has calibrated the evidence classifications. See `docs/TEST_REPORT.md` and
`docs/SCIENTIFIC_VALIDATION.md` for the actual results and limits.

## Data reproduction

```bash
python3 scripts/import_iaea.py         # offline reconstruction from bundled sources
python3 scripts/import_iaea.py --refresh  # explicitly retrieve a new source snapshot
npm run validate:data
```

Review data and evaluation differences after a refresh. Rebuild and rerun
validation before distributing an updated database. Do not silently substitute
relative transition intensities for absolute photons per parent transformation.

## GitHub

Suggested repository: `NuclearIsotopeID-Lab`. Upload the **contents** of this
folder as the repository root, including `.github/`. CI validates data, tests,
types and the production build, then runs Chromium desktop/mobile tests.
GitHub Pages deployment is a separate manual workflow with an explicit boolean
approval input, targeting `/NuclearIsotopeID-Lab/`. Nothing was published during
preparation. See `docs/GITHUB.md` for step-by-step instructions.

## Project layout

- `src/physics/`: ten independent, React-free scientific functions and tests.
- `src/io/`: parsers, units handling, frozen-snapshot exports and preferences.
- `src/components/`, `src/App.tsx`: bilingual application and charts.
- `src/data/gamma-lines.json`, `data/`: normalized library and source snapshots.
- `scripts/`: reproducible data import, validation and standalone bundling.
- `docs/`: scientific, uncertainty, source, uniqueness and validation reports.
- `tests/e2e/`: desktop and mobile Playwright scenarios.
- `dist/`: included production files and direct-open HTML.

Original code is MIT-licensed. Reference data retain their source terms; see
`NOTICE.md`. No institutional endorsement is implied.
