# Reference data specification

## Fixed snapshot

Normalized file: `src/data/gamma-lines.json`.
Tabular export: `data/gamma-lines.csv`.
Manifest and source hashes: `data/manifest.json`.
Byte-for-byte source responses: `data/raw/*-gamma.csv`.
Importer: `scripts/import_iaea.py`; it uses Python's standard library only.

The library contains 667 nuclear gamma transitions for 11 parent states,
20–3500 keV. Weak published transitions are retained rather than padded with
invented prominent lines. With the default minimum absolute probability of
0.001 per transformation (0.1%), 206 lines are eligible. Unknown probability is
retained for energy-only screening and never converted from relative intensity.

| Parent | Stored nuclear lines | Eligible at default filter | Evaluation publication cutoff(s) |
| --- | --- | --- | --- |
| Co-60 | 6 | 2 | 31-Dec-2012 |
| Cs-137 | 2 | 1 | 1-Oct-2006 |
| Na-22 | 1 | 1 | 1-Apr-2015 |
| Eu-152 | 173 | 42 | 31-Aug-2013 |
| Ba-133 | 9 | 9 | 31-Oct-2010 |
| Am-241 | 128 | 27 | 15-Mar-2006 |
| I-131 | 19 | 9 | 17-Jul-2006 |
| Tc-99m | 5 | 1 | 1-Jul-2017 |
| K-40 | 1 | 1 | 30-Sep-2015 |
| Bi-214 | 302 | 100 | 1-May-2021; 31-Mar-2014 |
| Pb-214 | 21 | 13 | 1-May-2021 |

These are row-level literature cutoffs, not a statement that ENSDF as a whole
has those release dates. The API guide describes an April 2022 ENSDF snapshot;
the exported extraction date is 2026-10-14. The importer preserves differing
cutoffs across decay datasets rather than inventing one universal evaluation.

## Record dictionary

| Field | Meaning |
| --- | --- |
| id | Parent-query plus original CSV line number; deterministic source record identity |
| nuclide | Selected parent state, e.g. Tc-99m rather than undifferentiated Tc-99 |
| daughter | Daughter nuclide associated with the referenced decay dataset |
| radiationType | gamma; X rays/annihilation rows are outside the production library |
| energyKeV / energyUncertaintyKeV | Evaluated emitted-photon energy and source uncertainty; null remains unknown |
| emissionProbability | Absolute emitted photons per parent transformation, fraction |
| emissionProbabilityUncertainty | Source absolute uncertainty converted from percentage point to fraction |
| intensityKind | Explicit absolute-photons-per-parent-transformation marker |
| transitionId | Daughter, start/end nuclear level and decay mode context |
| startLevelKeV / endLevelKeV | Nuclear level information from the source, not substituted for photon energy |
| parentLevelKeV | Parent-state selection field from the original API response |
| decayMode / multipolarity | Original nuclear context, when supplied |
| source | IAEA LiveChart / ENSDF |
| evaluationVersion / evaluationAuthors | Source publication cutoff and evaluators; null if not supplied |
| extractionDate | Actual source extraction date, separate from evaluation |
| sourceUrl | Exact query used to retrieve this parent dataset |
| sourceRow / rawFile | Locates the original source row in the retained response |
| dataStatus | Evaluated nuclear-gamma subset; not independently re-evaluated |

No field is called a transition probability when it actually represents emitted
photons per parent decay. Internal-conversion-inclusive probabilities and
relative adopted gamma intensities are not substituted. An annihilation yield
can exceed one photon per transformation; such radiation is excluded rather
than squeezed into a nuclear-gamma probability field.

## Selection and audit rules

1. Fetch `fields=decay_rads`, one mass+element per query, `rad_types=g`.
2. Preserve raw bytes and calculate SHA-256 before transformation.
3. Select parent excitation 0 for ground states, or the stated Tc-99m state
   within 0.02 keV. Reject unknown shifted parent levels.
4. Require source start/end nuclear transition levels. Exclude appended atomic
   rows and annihilation rows without those nuclear levels.
5. Keep finite photon energies from 20 to 3500 keV. Preserve unknown uncertainties
   and probabilities; reject values outside the supported yield semantics.
6. Convert the source absolute intensity percent and its uncertainty by /100.
7. Retain original row number, evaluation authors/cutoff and extraction date.
8. Independently validate hashes and every normalized energy/yield/uncertainty
   against the selected original CSV row with `npm run validate:data`.

Exact records are not collapsed in the source library: different transitions
or decay modes can share an energy. Candidate support uses one-to-one evidence
assignment, and the energy-only hypothesis model coalesces exact duplicate
centers to avoid multiplying duplicate reference density.

## Reproducibility and coverage limits

Offline reconstruction does not use the network and must reproduce the three
normalized deliverables. `--refresh` deliberately replaces snapshots and can
change values, row IDs, hashes or line counts. Inspect the diff; source evolution
is not a cosmetic update. Data replacement is not exposed as an unaudited UI
edit in v1. To extend the library, add a documented parent-state selection,
refresh, validate and add an independent reference test.

Missing isotope coverage cannot be inferred from unmatched peaks. Weak-line
filtering, the 20 keV lower bound, excluded atomic radiation, decay-chain
context and response effects restrict every interpretation.
