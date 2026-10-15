# Identification models

## Candidate ranking: support points, not probabilities

For each candidate:

`S = 10*N_independent + 3*N_exclusive + 2*mean(q_energy)`.

For a statistically justified residual `q_energy = exp(-z^2/2)`. For a declared
fallback window the bounded heuristic uses `r=3*delta/window` in the same
smooth weighting expression. This latter number is **not** a z statistic.
Independent support dominates the two-point energy-quality term. Evidence
points can exceed 100 and are not normalized probabilities. Missing-line and
intensity contradictions are separately displayed; they do not secretly modify
this ranking rule. The synthesized conclusion can be downgraded even when
ranking points remain high.

## Mixture attribution: bounded weighted cover

Enumerate subsets of the top 12 ranked parent candidates, at most the selected
1–4 components. Objective is explained independent-group weight minus
`0.35 * component_count`. An evidence group weighs the maximum externally
supplied member weight, or 1 with defaults. Connected overlap groups count once.
Every peak retains all matching parents within a proposed mixture, and
unexplained peaks remain explicit. The ten best subsets are returned, including
ties. Components with only one compatible line remain tentative in the report.

The default three-component bound may leave a fourth plausible component
unattributed; change the bound explicitly. The penalty is a project-defined
parsimony preference, not AIC, BIC, a posterior prior, concentration estimate or
activity ratio. Exact global optimization is only within this bounded candidate
space. A warning identifies candidate truncation. Matching pairs are indexed
once so broad windows do not create a repeated exhaustive pair scan per subset.

## Alternative hypotheses: a specified conditional centroid model

For an explicit parent set H, keep the eligible reference lines in the declared
energy range W. Exact duplicate reference energies and uncertainties are
coalesced. Let L_H be the number of remaining centers. Every center has equal
weight; no detector-response model or gamma abundance weighting is smuggled
into this energy-only model. For corrected observed centroid E_i, common offset
delta, supplied centroid and reference standard uncertainties, and fixed q:

`f(E_i | H,delta) = q/L_H * sum_j Normal(E_i-E_j-delta; 0,u_i^2+u_ref_j^2) + (1-q)/W`.

For the empty/clutter-only hypothesis use `f=1/W`, a normalized uniform density.
The same input centroids, range, q and filters must be used for all hypotheses.
This describes exchangeable **centroid locations**, not raw photon counts or
a complete gamma-emission/acquisition process. It can reuse latent line labels;
it is not an activity fit or a one-to-one physical event-allocation model.

The likelihood is the product over independent observed centroids, integrated
against the supplied common-offset density `Normal(delta;0,u_cal^2)`. Zero
assessed calibration uncertainty gives delta=0. Numerical integration uses
midpoint quadrature on ±6 standard deviations, with a node count chosen to
resolve the smallest supplied centroid uncertainty. The ignored normal tail is
less than 2e-9 in probability mass; that is a quadrature-domain statement, not
an identification confidence. The algorithm caps at 12001 nodes and five
million point/line/node evaluations per hypothesis; a model exceeding these
limits is marked unavailable instead of issuing a poorly resolved statistic.

Return `log L`, `Delta deviance = 2*(best log L - log L_H)`, and
`relative likelihood = exp(log L_H - best log L)`. These values are not
normalized across H and are **not Bayesian posterior probabilities, calibrated
isotope-presence probabilities, or Bayes factors**. The Gaussian common offset
is a measurement nuisance model, not an isotope-presence prior. Models within
Delta deviance 2 are labelled inconclusive by an explicit, uncalibrated
practical comparison rule. It is not a calibrated hypothesis test.

Comparisons are unavailable if any included reference energy uncertainty is
unknown, centroid uncertainties are missing, the calibration assessment is
missing, observed energies are out of range, overlap groups are unresolved, or
the bounded integration cannot resolve the requested scales. Tightening the
probability filter can remove weak incompletely specified lines, but the change
must apply consistently to every hypothesis. Low-count net areas are irrelevant
to this centroid-only likelihood; there is no count-based chi-square here.

## Synthesized evidence classes

| Class | Explicit implementation rule | Interpretation |
| --- | --- | --- |
| Strongly Supported | At least 3 independent exclusive lines; every assigned energy has complete uncertainties and abs(z)<2; at least one quantitatively assessable intensity ratio and all ratios compatible at abs(z)<=3; no conditional contradictions | Converging model-based evidence, uncalibrated class |
| Supported | At least 2 independent exclusive lines; all assigned energy abs(z)<2 with complete uncertainties; no conditional contradiction | Multi-line energy support, not definitive identification |
| Tentative | A compatible candidate that does not satisfy the stronger rules; or a candidate downgraded by conditional missing-line/intensity contradictions | Needs additional distinguishing measurement evidence |
| Ambiguous | No exclusive support group, or a rival explains all of this candidate's supporting peak IDs with at least the same independent line count | Data do not separate the alternatives |
| Insufficient Evidence | No eligible reference line supports any candidate | Does not establish the absence of nuclides |

The `abs(z)<2` and `abs(z)<=3` conditions are declared diagnostic cutoffs, not
coverage probabilities. A single exclusive line is always Tentative. A shared
single line is Ambiguous. An overall Supported result can coexist with weaker
components. Per-nuclide conclusions, contradictions, alternatives, source
quality, missing information, and unexplained peaks remain in the compound
report. The report does not simply rename the ranking score.

No independent experimental calibration dataset has established the false
positive rate of these classes. The `validation` object explicitly records
`independentExperimentalValidation=false` and `classificationsCalibrated=false`.
