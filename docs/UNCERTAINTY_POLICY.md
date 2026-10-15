# Uncertainty policy

## What is represented

| Quantity | Treatment | Missing-information behavior |
| --- | --- | --- |
| Peak centroid | User-supplied standard uncertainty, keV | Energy-dependent fallback window; no statistical z |
| Calibration offset | Known user-supplied correction; positive value subtracted | No fitted correction from candidate residuals |
| Calibration uncertainty | Explicitly assessed value, common fully correlated offset | Without assessment, no total-energy z or likelihood |
| Reference photon energy | Source value and source standard uncertainty retained | No invented zero; fallback match and unavailable affected fits |
| Net peak area | User estimate and separately supplied uncertainty | No sqrt(net area) substitution |
| Full-energy efficiency | Absolute probability; log-log interpolation; no extrapolation | Withhold response-dependent quantitative claims |
| Efficiency uncertainty | Source/user absolute u at curve points; conservatively interpolated relative u | Point estimates only where possible |
| Cross-energy efficiency correlation | User input rho in [0,1] | Default 0 is displayed as a stated model assumption, not a measured fact |
| Gamma photon yield | Source absolute photons per transformation and its uncertainty | Energy-only use if missing; no relative-to-absolute normalization guess |
| Summing | Unassessed, assessed-negligible, or supplied multiplicative factors and u | Unassessed suppresses numerical intensity z and adverse missing-line evidence |
| Additional ratio-model error | Explicit relative standard uncertainty applied once to expected ratio | Blank suppresses numerical ratio z and quantitative absence evidence |
| Overlapping peak fits | Merge supplied FWHM intervals for independent support; exclude shared/overlap intensity anchors | No fake independent area fit covariance |

The initial simulation explicitly assumes assessed zero calibration uncertainty
and zero extra ratio-model uncertainty, using its declared illustrative
response curve. A first user measurement edit/import clears those simulation
assumptions and the illustrative curve. Filter-only changes retain the
simulation provenance. No measured calibration quality is invented.

## Correlated residuals

For multiple lines, the full common-offset covariance term is included:
`V_ij = delta_ij*(u_peak_i^2+u_ref_i^2) + u_cal^2`.
The analytical test with two +1 keV residuals, unit independent uncertainties
and a unit common calibration uncertainty gives chi-square 2/3. Treating the
calibration term as independent per peak would give the wrong statistic.
Opposite +1 and -1 residuals give chi-square 2: a common offset cannot remove
opposite errors. No chi-square p-value is represented as isotope confidence.

For an efficiency ratio, relative variance is
`u_rel_i^2 + u_rel_a^2 - 2*rho*u_rel_i*u_rel_a`. Emission-probability and summing
covariances are not supplied and are assumed independent with an explicit
warning. Reference-energy evaluation covariance and calibration slope
covariance are also not supplied. The report is limited to its stated model;
unknown covariance is not claimed to have been metrologically resolved.

## Missing information is not zero

`null`/blank reference uncertainty is preserved as unknown. User uncertainty
fields are optional unless a particular calculation needs them. The app does
not replace an unknown uncertainty by an arbitrary percentage, detector
resolution, sqrt(area), or a hidden default. A user may explicitly assess a
term negligible, but that assertion is visible in the exported settings.

FWHM describes a peak width, not its centroid standard uncertainty. The app does
not divide FWHM by an invented event count or turn it into centroid uncertainty.
A fallback matching half-window is a declared screening assumption, not a
standard uncertainty. Numerical approximation and floating-point safeguards do
not increase the measurement's information.

## Model limits

Ratios are first-order diagnostics for isolated high-count peaks. A Gaussian
ratio z is withheld below 25 net counts or above 30% supplied relative area
uncertainty. These are declared heuristic limits, not statistical calibration.
A mean-count lower estimate used for missing lines is not a predictive
probability of detecting that line. Incomplete lists, unknown threshold, absent
response, unassessed summing, impure anchors or missing model uncertainty
prevent a quantitative contradiction.

No claim of exact confidence, Bayesian posterior, total spectral count
coverage, source activity, isotope concentration, or proof of absence is made.
See JCGM 100:2008 section 5.2 for the general correlated-input propagation
framework; the application's restricted measurement models are specified in
`SCIENTIFIC_METHODS.md` and are not official laboratory validation protocols.
