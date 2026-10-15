# Gamma line matching

## Function contract

`matchGammaLines(peaks, lines, settings)` returns every compatible
peak/reference pair, its signed energy difference, the half-window, the
matching basis and a justified z residual when available. It also returns
connected FWHM overlap groups and warnings. Nuclear reference data are filtered
by radiation type, declared range and minimum absolute photon yield.
Unknown reference intensity does not suppress an otherwise valid energy-only
match, but that line cannot support intensity or detectability calculations.

## Sign and units

All computations are in keV. A positive known calibration offset is subtracted
from the observed energy before matching. The residual is corrected measured
energy minus reference emitted-photon energy. This convention is recorded in
reports and CSV; the original measured centroid remains in the input section.

For `u_centroid=0.3`, `u_reference=0.4`, `u_cal=0.5` keV and delta `0.6` keV:
combined standard uncertainty is `sqrt(0.50)=0.7071067811865476` keV and z is
`0.848528137423857`. This analytical case is not nuclear reference data and is
tested independently of the matching implementation.

The fallback window depends on energy and has no statistical z residual. For
`a=0.3 keV`, `ppm=4000`, measured energy `100.2 keV`, its half-window is
`sqrt(0.3^2 + 0.4008^2)`. Do not call this a three-sigma match.

## Assignment and overlap

All compatible pairs are retained for review. Independent candidate support is
a separate maximum-cardinality matching on measured overlap groups and
reference transition IDs. The same observed centroid cannot count as two
independent gamma signatures for one nuclide. When another nuclide can explain
the same group, the group is non-exclusive. The app never resolves an equal
energy ambiguity by alphabetic order or by silently discarding alternatives.
Candidate ordering is only presentation; alternative assignments remain visible.

## Reference physics check

LNHB's Co-60 table illustrates why emitted gamma energies must be distinguished
from transition level differences: section 2.2 lists the 1173.240 keV
transition, whereas section 5.2 gives the emitted photon at 1173.228(3) keV.
The production library uses the IAEA emitted-photon value. The 1332.492(4) keV
photon is likewise distinct from its 1332.508 keV level spacing. See the
independently reviewed photon-emission table at
https://www.lnhb.fr/nuclides/Co-60_tables.pdf (section 5.2).

No recoil correction is applied to already evaluated photon energies. No
internal-conversion-inclusive transition probability is substituted for the
absolute gamma photon emission probability.

## Limits

Pairwise k-sigma windows are marginal compatibility screens. They do not
control a library-wide false discovery rate. Increasing k, using a weak-line
filter or using a large reference library creates more chance matches. The
application therefore retains ambiguities, requires independent multi-line
support for supported classes, and discloses the actual filters.
