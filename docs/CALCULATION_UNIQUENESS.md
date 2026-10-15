# Calculation uniqueness audit

The ten functions answer different scientific questions. They share validated
inputs and compatible line pairs but not a recycled output score.

| Function | Scientific question | Primary output | Inputs | Method | Difference from the other nine | Difference from Projects 01–08 |
| --- | --- | --- | --- | --- | --- | --- |
| 01 Energy matching | Which evaluated photon lines are energy compatible with each centroid? | Pair list, signed differences, justified z or declared-window basis | Centroids, standard uncertainties, calibration, reference energies | Marginal uncertainty window or explicit energy-dependent screening window | Generates compatibility evidence; does not rank parents or synthesize confidence | No half-life propagation, structure/level calculation, reaction kinematics, emission-spectrum generation, calibration fitting, shielding, neutron or fission calculation |
| 02 Candidate ranking | Which parent has the greatest independent observed support? | Ordered uncalibrated evidence points with explanation | Compatible pairs and overlap groups | Maximum-cardinality assignment; 10N+3U+2q | A transparent discovery ordering; not a multi-line fit statistic, coverage denominator or probability | Identifies parent candidates from measured evidence, rather than predicting radiation or extracting/calibrating peaks |
| 03 Multi-line consistency | Are several assigned centroid residuals compatible under their correlated error model? | Correlated centroid chi-square, degrees of freedom, residual distribution | Independent assignments, source/centroid uncertainties, common calibration u | V=diag(u_i²+u_ref_i²)+u_cal²11ᵀ; quadratic form | A covariance-sensitive continuous diagnostic, independent of support-point scale | Consumes calibration results without estimating calibration/FWHM/area as a new function |
| 04 Missing lines | Would an unobserved line be detectable under an explicit anchor and sensitivity model? | Per-line visibility / conditional contradiction with expected mean counts | Absolute photon yields, isolated anchor area/u, efficiency/u, summing, ratio-model u, threshold, completeness | Detector-weighted anchor ratio and conservative lower mean-count bound | Supplies conditional counter-evidence rather than rewarding observed matches | No activity/decay, efficiency calibration, detection-threshold estimation or shielding tool is replicated |
| 05 Ambiguity | Which observed groups admit competing parent assignments? | Shared-parent graph and candidate discriminating lines | All compatible pairs, reference library, declared screening window | Distinct parent sets per evidence group; separated-line search | Retains equivalence classes and requests discriminating evidence; not an arbitrary tie-break | Not a radiation-line generator: the question is non-uniqueness in an observed identification problem |
| 06 Relative intensity | Do isolated peak-area ratios agree after detector-response weighting? | Observed/model ratios and justified diagnostic log residuals | Net areas/u, absolute yields/u, full-energy efficiency/u/correlation, summing and model u | Ratio propagation with configurable response covariance; low-count restrictions | Tests response-dependent relative proportions, unlike centroid fitting or coverage | Does not re-integrate peaks, calibrate efficiency, infer dose or calculate activities |
| 07 Mixture attribution | Which bounded parent sets explain the independent evidence? | Ten candidate subsets, per-peak parent alternatives and unexplained peaks | Candidate sets, compatible-pair index, group weights, component bound | Enumerated weighted cover minus 0.35 per component | A combinatorial multi-parent explanation, not a single-parent ranking or statistical posterior | No fission-yield composition, chain population calculation or structure mass balance is repeated |
| 08 Coverage | What fraction of the supplied evidence is explained? | Separate listed-peak, group, weight and listed-net-area fractions | Observed peaks, group structure, explained IDs and optional external weights | Explicit numerators and denominators; overlapping groups count once | Descriptive completeness with no probability claim; not a fit score | Measures identification evidence coverage, not detector efficiency, physical attenuation or decay fraction |
| 09 Hypothesis comparison | Which explicitly specified conditional centroid model better describes the same observed list? | Log likelihood, Delta deviance, relative likelihood and inconclusive status | Candidate parent sets, complete centroid/ref u, common calibration u, q and range | Equal-line Gaussian mixture plus uniform clutter; integrated shared nuisance | A specified data-density comparison across sets; distinct from ranking/cover and no count chi-square | Does not fit an energy calibration, simulate fission/neutron transport or solve reaction/decay processes |
| 10 Evidence report | What conclusion is supportable and what prevents a stronger one? | Compound, auditable per-nuclide assessment and reproducible report | Supports, exclusivity, residuals, intensity, contradictions, alternatives, sources and quality limits | Explicit conservative verbal synthesis plus complete evidence and model disclosure | Can downgrade a top-ranked candidate and retain weaker mixture components; no new score masquerades as confidence | A new identification decision-support output rather than an eighth-project physical calculator |

## Particular overlap review

- **Ranking vs multi-line consistency:** two exact lines receive 28 evidence
  points under the declared rule; their centroid chi-square is 0. Perturbing
  both with a common calibration component changes the covariance statistic
  without changing the number of independent support groups.
- **Ranking vs coverage:** ranking rewards exclusive support for a parent.
  Coverage asks how many input observations/groups/weights are explained by
  a selected model. A two-line candidate in a twenty-peak list can rank first
  while explaining only 10% of the listed peaks.
- **Coverage vs hypothesis comparison:** identical coverage can have different
  residual likelihoods, and a model's line-density normalization matters.
  Neither weighted fraction nor listed-area fraction is a posterior probability.
- **Mixture cover vs hypothesis comparison:** the former explicitly trades
  explained groups against a fixed component penalty; the latter evaluates an
  actual stated conditional density for the same centroids. Their objectives
  and interpretations are exposed separately.
- **Ranking vs report:** a candidate keeps its ranking score if a detectable
  unobserved line or inconsistent corrected intensity creates counter-evidence;
  the compound conclusion is downgraded to Tentative. It also reports the
  competing explanations, source limitations and unassessed quantities.

No feature was replaced by a duplicate rendering of a matching percentage.
Shared inputs, tables and exports do not turn these primary outputs into the
same calculation. The project does not modify Projects 01–08.
