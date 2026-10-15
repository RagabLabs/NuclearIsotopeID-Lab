# Known limitations and remaining review work

1. **Real-browser QA is not completed in this delivery environment.** The
   supported browser-control capability was unavailable. Eighteen configured
   Playwright desktop/mobile cases are included and listed, but were not run.
   No real-browser download, PNG rasterization, responsive layout or screenshot
   result is claimed. Vitest/jsdom is DOM verification, not visual browser QA.
   CI installs Chromium and runs these tests when the repository workflow runs;
   that remote CI run has not occurred during this preparation.
2. **No independent experimental campaign.** Analytical fixtures and declared
   simulations validate implementation behavior. They do not calibrate false
   identification rates, clinical/industrial suitability, detector models or
   verbal confidence classes.
3. **Finite reference set.** Eleven selected parent states and a 20–3500 keV
   range cannot identify arbitrary nuclides. Default filtering hides very weak
   transitions. Atomic X rays, annihilation radiation, escape/sum peaks,
   continua and spectral artefacts are outside the library.
4. **Snapshot age.** Per-line evaluations predate the retrieval. The API guide
   describes an April 2022 ENSDF snapshot. A newer LNHB Cs-137 evaluation differs
   slightly and is disclosed; the library is not advertised as latest ENSDF.
5. **Peak-list assumptions.** No raw-spectrum calibration, baseline estimation,
   deconvolution or area integration is performed. Provided peaks are assumed
   resolved when FWHM is absent. Source extraction quality and peak-list
   completeness must be established externally.
6. **Restricted covariance models.** Calibration is a common offset, not a full
   nonlinear energy-calibration covariance. Reference-energy and yield
   covariances are not supplied; yield/summing ratio terms assume independence.
   Efficiency correlation is configurable; arbitrary fitted-peak covariance is
   not represented. Additional model uncertainty must be provided explicitly.
7. **Intensity caveats.** Geometry, sample attenuation, dead time, pile-up,
   coincidence summing, and acquisition-time decay can alter the response.
   User curves are not automatically calibrated or validated. Unassessed model
   terms suppress quantitative diagnostics. The low-count thresholds are
   uncalibrated software heuristics, not confidence limits.
8. **Missing lines are conditional.** The lower predicted mean count is not a
   detection probability or prediction interval. A missing line cannot prove
   nuclide absence. Impure anchors, incomplete lists and weak sensitivity can
   invalidate the premise.
9. **Ranking / mixture heuristics.** Evidence points, verbal classes and the
   0.35 component penalty are transparent but uncalibrated. The mixture search
   is exhaustive only within the top twelve candidates and selected 1–4
   component bound. It infers no activity fraction or chemical composition.
10. **Conditional likelihood scope.** The explicit equal-line energy-centroid
    mixture is not a full spectral formation model. Reference centers receive
    equal weights; repeated latent labels are allowed. Results depend on the
    range, filter and fixed inlier/clutter choice. No posterior or Bayes factor
    is claimed. Very expensive/narrow nuisance integrations are withheld.
11. **Exports and language.** The UI supports Arabic/English. PDF labels are
    English for consistency, with a bundled Unicode font to preserve scientific
    symbols and user metadata. Browser file-download policies vary. PNG export
    requires actual browser Canvas, which remains in the unexecuted browser
    test set. CSV/JSON carry full unrounded numeric evidence and source metadata.
12. **Publication is not performed.** The GitHub repository is not assumed to
    exist. The manual Pages workflow requires explicit approval input. A
    successful local build is not proof of a successful GitHub deployment.

Review priority before scientific distribution: run the included actual-browser
checks, visually inspect mobile/RTL layouts and exports, then evaluate the
models against independent labelled measurements from the intended detector
and use case. The software must not be marketed as a definitive isotope
certificate or a substitute for an accredited laboratory method.
