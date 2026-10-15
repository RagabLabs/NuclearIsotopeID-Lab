# Scientific validation

## Validation level

The scientific implementation has analytical invariants, declared simulations, independently checked numerical formulas, published Co-60 photon-data spot checks, and raw-source traceability. This is implementation verification, not an independent laboratory validation of isotope-identification performance.

## Analytical expected values and observed outputs

| Function | Independent expected result | Actual result | State |
| --- | --- | --- | --- |
| 01 Gamma energy matching | delta=0.6 keV; sigma=sqrt(0.5); z=0.6/sqrt(0.5) | delta=0.5999999999999943; sigma=0.7071067811865476; z=0.8485281374238489 | PASS |
| 02 Candidate ranking | N=2; U=2; evidence points=28 | N=2; U=2; score=28 | PASS |
| 03 Multi-line consistency | chi-square=2/3; degrees of freedom=2 | chi-square=0.6666666666666667; dof=2 | PASS |
| 04 Missing expected lines | Expected mean 1000 counts; conditional expected-not-seen | expected=1000; state=expected-not-seen; lower=895.0428658927846 | PASS |
| 05 Shared-line ambiguity | One shared group containing Sim-A and Sim-B | groups=1; parents=Sim-A, Sim-B | PASS |
| 06 Relative intensity consistency | Observed=1; expected=1; diagnostic z=0 | observed=1; expected=1; z=0 | PASS |
| 07 Mixed-isotope attribution | Best set Sim-A+Sim-B; coverage 2/3; unexplained u | set=Sim-A+Sim-B; coverage=0.6666666666666666; unexplained=u | PASS |
| 08 Evidence coverage | Peak fraction=0.5; weighted=0.75; listed-area=0.1 | peak=0.5; weighted=0.75; listed-area=0.1 | PASS |
| 09 Alternative hypotheses | log[0.9/(sqrt(2*pi)*0.1)+0.1/980]=1.278314463549419 | logL=1.278314463549419; relative=1 | PASS |
| 10 Evidence report | Tentative; independentExperimentalValidation=false; classesCalibrated=false | status=Tentative; experimental=false; calibrated=false | PASS |

## Independence of expected results

Quadrature, the inverse of V=I+11^T, detector-weighted ratios, explicit fractions and the one-line Gaussian-plus-uniform density have hand-stated expected values. The two-centroid shared-calibration likelihood test is checked against a closed-form Gaussian-mixture expansion. Expected values are not obtained by calling the matching or ranking engine. Test-only fixture names and response curves are explicitly simulated. Production reference records are the downloaded IAEA rows.

## Published checks

The Co-60 photon emissions in LNHB section 5.2 independently agree with the selected 1173.228 and 1332.492 keV reference records and their absolute yields/uncertainties. Tests distinguish photon energy from nuclear level spacing. Tc-99m state selection and exclusion of the non-specific 511 keV annihilation line are checked. The newer LNHB Cs-137 evaluation difference is disclosed in DATA_SOURCES.md and is not silently substituted into the fixed IAEA snapshot.

## Tested scientific boundaries

Exact, within-window and outside-window energies; absent uncertainty; common calibration offset and covariance; independent/overlap assignments; shared single lines; multiple supports; missing detectable lines; weak sensitivity; unknown efficiency/intensity/model uncertainty; low-count ratios; mixed parents; equivalent hypotheses; unknown nuclides; empty/no-match inputs; invalid radiation; duplicate peaks; numerical underflow input guards; and stale/export consistency are represented.

## Unvalidated questions

No empirical false-positive rate, sensitivity/specificity, calibrated confidence, Bayesian posterior, material concentration or activity accuracy is established. No spectrum of arbitrary composition is guaranteed identifiable from this bounded library. Independent labelled measurements spanning the intended detectors, backgrounds, matrices and mixtures are required before such claims.
