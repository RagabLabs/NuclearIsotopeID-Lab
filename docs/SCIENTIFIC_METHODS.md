# Scientific methods

## Domain and observation model

The observation is a calibrated **peak list**: centroid energies, optional
standard uncertainties, optional net areas and their uncertainties, and optional
FWHM. It is not a raw spectrum, channel histogram, decay-rate estimate or event
stream. The reference library contains evaluated emitted nuclear gamma photons
for selected **parent states**, not a universal list of nuclear level spacings.
All internal energies are keV and probabilities are photons per parent
transformation, represented as fractions rather than percent.

Each row can be energy compatible with several reference lines. Compatibility
is evidence for investigation, never a proof of presence. The finite library,
source evaluation age, optional filtering and detector sensitivity all limit
negative conclusions. Parent-chain equilibrium is never assumed.

## Energy and correlation

For a corrected measured centroid E and reference gamma energy Eref:

`delta = Emeasured - declared_offset - Eref`.

With complete standard uncertainties and an explicitly assessed calibration
uncertainty, marginal variance is `u_centroid^2 + u_reference^2 + u_cal^2`.
Compatibility requires `abs(delta) <= k * sqrt(variance)`. The displayed z is
this marginal residual; it is not an isotope confidence score.

For several independent assigned centroids, the covariance is
`V = diag(u_centroid_i^2 + u_reference_i^2) + u_cal^2 * 11^T`.
The app evaluates `delta^T V^-1 delta` by the Sherman-Morrison formula and
computes the log determinant with the matrix-determinant lemma. No calibration
offset is fitted from the identification residuals: the supplied offset is
subtracted and the supplied common uncertainty is retained. Degrees of freedom
are the number of assigned independent centroids. No p-value or identification
probability is attached to this statistic.

The common term represents a fully correlated offset, not arbitrary nonlinear
or slope calibration errors. Reference-energy covariances are not supplied by
the imported interface and are treated as diagonal for this diagnostic. A
laboratory with a full calibration covariance must use a fuller model before
metrological conclusions.

Without complete uncertainties, the explicit fallback half-window is
`sqrt(a^2 + (ppm * E * 1e-6)^2)` keV. Its components are user choices, not invented
standard uncertainties. Those matches have no z score or Gaussian fit statistic.

## Independent line evidence

Measured FWHM intervals are merged into connected overlap groups. An overlapping
group can contribute at most one independent support for a candidate. Within a
candidate a maximum-cardinality bipartite assignment gives one reference line
to one measured group. This avoids counting the same peak several times or
reusing one transition for several nearby centroids. Neighbors are ordered by
energy residual for deterministic tie handling; among maximum-cardinality
assignments a globally minimum residual is not guaranteed.

If widths are absent, the supplied peak-list rows are provisionally treated
as separate resolved centroids. Their extractor's resolution and fit covariance
remain the user's responsibility. Unknown overlap cannot be inferred reliably
from centroid standard uncertainty alone.

## Orthogonal analyses

Ranking is an explicitly arbitrary support-based score, not a likelihood.
Multi-line consistency is a correlated Gaussian energy-residual diagnostic.
Coverage measures observed evidence explained with distinct denominators.
Mixture attribution is bounded set-cover optimization with a component penalty.
Hypothesis comparison uses an explicit conditional centroid-density model.
The report applies conservative verbal rules combining these different results.
Their differences are audited in `CALCULATION_UNIQUENESS.md`.

## Detector-weighted intensity ratios

For isolated, non-shared assignments, predict full-energy response as
`P_i * epsilon_i * s_i`, where P is the absolute emitted-photon yield, epsilon
is full-energy peak efficiency and s is the declared summing response factor.
Choose the largest usable observed net-area peak as the anchor. Compare
`R_observed = N_i/N_anchor` with the corresponding predicted response ratio.

First-order relative ratio variance includes the supplied two net-area
uncertainties, two emission uncertainties, efficiency-ratio covariance with
user-specified correlation, summing-factor terms, and an explicit additional
relative ratio-model uncertainty. Expected-ratio uncertainty is reported
separately from observed-ratio uncertainty. The diagnostic standardized log
residual is `log(R_observed/R_expected) / sqrt(v_observed + v_expected)`.

Emission and summing errors are treated as independent because their
covariances are unavailable. Ratios share an anchor and are correlated with
one another; no independent-ratio chi-square is computed. The extra model term
can represent externally assessed geometry, matrix, attenuation and other
ratio-model uncertainty. It is never silently set to zero for user data.

If either net area is below 25, either supplied relative area uncertainty is
above 0.3, any required uncertainty is missing, or summing is unassessed, no
Gaussian ratio residual is given. The 25-count / 0.3 criteria are conservative
software heuristics, **not a validated Gaussian-validity theorem or confidence
level**. No Poisson uncertainty is synthesized from background-subtracted net
area. A low-count spectral likelihood must be fitted to raw counts externally.

## Conditional unobserved-line assessment

From a pure, isolated, non-shared high-count anchor in the same measurement,
`N_expected_j = N_anchor * (P_j epsilon_j s_j)/(P_anchor epsilon_anchor s_anchor)`.
Measurement duration and common source normalization cancel; metadata are
retained. The conservative bound on the predicted mean is
`max(0, N_expected_j - k * u_expected_j)`.

Only a complete peak list, a known external net-count threshold, full response
coverage, assessed summing and all required uncertainties allow a line to be
labelled `expected-not-seen`. The bound must exceed the threshold. Otherwise
status is observed, below-sensitivity or not-assessable. This is a conditional
model contradiction, not a proof of nuclide absence, a calibrated detection
probability, or a predictive interval for noisy counts. Detection thresholds
and limits are different laboratory concepts; this app accepts a threshold and
does not estimate either from a list of selected positive peaks.

## Source and mathematical grounding

Nuclear line semantics follow IAEA LiveChart's decay-radiation guide and the
ENSDF-derived API. The covariance propagation is an explicit application of
standard first-order uncertainty propagation, with the treatment of correlated
inputs discussed in JCGM 100:2008, section 5.2. The ranking, mixture penalty,
conditional centroid model and verbal classes are project-defined research
models, fully specified here; they are not attributed as official IAEA or JCGM
identification procedures. See `DATA_SOURCES.md` for primary-source links.
