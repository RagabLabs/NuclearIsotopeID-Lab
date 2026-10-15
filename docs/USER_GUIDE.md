# User guide

## First identification

1. Open Complete identification. The initial state is visibly labelled simulated.
2. Import CSV/TSV/JSON, paste a peak list, or choose Manual entry. At least one
   finite positive energy is required; other fields are optional.
3. Review the energy units. `energy_keV` and `energyKeV` remain keV even if the
   generic selector says MeV. `energy_MeV` is explicitly converted.
4. In Matching & measurement model, enter centroid/calibration information as
   available. Enable the calibration-assessed checkbox only for a supplied or
   explicitly assessed value. Unknown uncertainties are not silently estimated.
5. Optionally enter your own efficiency table and uncertainty information.
   Assess summing; provide an additional response-ratio model uncertainty.
6. Run identification. Inspect each candidate and its lines. Check the shared
   assignments, unobserved-line states, unexplained peaks and alternatives.
7. Export the snapshot. Changes disable exports until successful reanalysis.

The overall report status summarizes the best-supported component; it does
not certify the entire mixture. A supported Co-60 candidate can coexist with
single-line tentative Cs-137, an ambiguous contribution, and unexplained peaks.
Inspect every nuclide-specific conclusion.

## Accepted peak-list fields

| Meaning | Canonical CSV key | JSON key | Optional? |
| --- | --- | --- | --- |
| Measured photon energy | energy_keV | energyKeV | No |
| Centroid standard uncertainty | energy_uncertainty_keV | energyUncertaintyKeV | Yes |
| Net full-energy peak area | net_peak_area | area | Yes |
| Supplied net-area standard uncertainty | peak_area_uncertainty | areaUncertainty | Yes |
| Peak width used only for overlap grouping | fwhm_keV | fwhmKeV | Yes |
| Live measurement time metadata | measurement_time_s | measurementTimeSec | Yes |
| Detector metadata | detector_id | detectorId | Yes |
| Externally supplied evidence weight | weight | weight | Yes, defaults to 1 |
| Peak identifier | id | id | Yes, defaults to P1, P2, ... |

Generic `energy`, `uncertainty`, `fwhm` use the selected energy unit. Other
accepted labels include `peak_energy`, `net_area`, `area_uncertainty`, `counts`
(for a supplied **net peak area**, not a raw channel), and `measurement_time`.
Duplicate aliases for the same quantity are rejected. Missing values are blank
or null. `NaN`, Infinity, duplicate energies/IDs, malformed CSV and raw channels
are rejected. Quoted commas, escaped quotes and quoted newlines are supported.

CSV/TSV headers are mandatory. JSON example:

```json
{"energyUnit":"keV","peaks":[
  {"id":"P1","energy":1173.228,"uncertainty":0.1,"area":3994,"areaUncertainty":65},
  {"id":"P2","energy":1332.492,"uncertainty":0.1,"area":3499,"areaUncertainty":60}
]}
```

The numeric example is simulated. Imported net-area uncertainty is not replaced
by sqrt(net area): background subtraction and fitted-peak covariance matter.
Measurement duration is preserved as metadata. When predicting ratios within
the same spectrum, duration and a common source-strength scale cancel; duration
is not requested as a meaningless extra required field. An acquisition with
significant decay during counting needs an external time-dependent response
model; this application does not correct it.

## Efficiency and summing CSV

```csv
energy_keV,efficiency,uncertainty,summing_factor,summing_uncertainty
100,0.10,0.005,0.97,0.02
1000,0.02,0.001,0.99,0.01
```

This table is illustrative, not a calibration. Efficiency is a dimensionless
absolute full-energy probability. `uncertainty` is absolute, not percent.
Between points efficiency is interpolated linearly in log(E), log(efficiency).
Endpoint relative uncertainties are conservatively interpolated without a
false gain from independent interpolation. No extrapolation is performed.
Summing factors are positive multiplicative response factors. If corrected
summing is selected, supply factors and uncertainties over the needed range.
Otherwise select assessed-negligible or keep unassessed. A geometry, sample
matrix or self-attenuation mismatch cannot be fixed by renaming the detector.

The extra ratio-model uncertainty is a relative standard uncertainty applied
to the predicted line ratio, once. A blank value leaves quantitative ratio
residuals and missing-line contradictions unavailable; zero is an explicit
user assertion that the additional term was assessed negligible.

## Missing lines

A numerical missing-line contradiction additionally requires the peak-list
completeness declaration and an externally justified net-count threshold in
the declared energy range. The app does not derive a decision threshold or a
detection limit from the listed net counts. The lower estimate refers to the
predicted mean counts under the anchor model, not a calibrated detection
probability or a bound on a future noisy measurement.

## Hypotheses

Select any supported nuclide combination in A and B; empty selection is the
clutter-only model. The same frozen peaks, range, probability filter and fixed
inlier fraction are used for every model. Models with missing required
uncertainties, unresolved groups or excessive quadrature cost are explicitly
unavailable. A relative likelihood of 1 is the best value among the compared
models, not a 100% identification probability.

## Practical limits

Up to 200 peak records; 2 MB per imported peak file; 20–3500 keV reference range;
maximum 12 candidates and 1–4 components in the mixture search. Centroid
standard uncertainties lie in 1e-9–1000 keV, energies up to 1e7 keV are accepted
and retained as out-of-range when applicable. Positive nonzero net areas below
1e-9 and numeric metadata above 1e15 are outside the numerical input scope.
Absolute efficiencies must be 1e-12–1. These bounds prevent numerical overflow;
they do not establish experimental suitability.
