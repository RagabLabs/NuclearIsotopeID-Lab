# Data sources and source review

Source review and raw retrieval: 2026-10-14. Further review of the LNHB photon
emission tables and release documentation was completed 2026-10-15. These are
access dates, not new nuclear evaluation dates.

## Production numerical source

**IAEA Nuclear Data Section, LiveChart / ENSDF decay radiations**

- Chart: https://www-nds.iaea.org/relnsd/vcharthtml/VChartHTML.html
- API guide: https://www-nds.iaea.org/relnsd/vcharthtml/api_v0_guide.html
- Quantity guide: https://www-nds.iaea.org/relnsd/vcharthtml/guide.html
- Query: `https://www-nds.iaea.org/relnsd/v1/data?fields=decay_rads&nuclides=60co&rad_types=g`
- Other nuclide queries are preserved verbatim in `data/manifest.json`.

Use `decay_rads`, not `gammas`: the latter concerns transitions in the named
nuclide, while decay radiation is emitted following the parent decay. The
quantity guide distinguishes absolute gamma intensity from relative adopted
transition intensity. API intensity percentages are divided by 100 exactly
once to obtain photons per parent transformation; no independent normalization
or additional decay-branch multiplication is invented. Half-life uncertainties
use a different notation in the API and are not reused as energy uncertainties.

The API documents that metastable states lack a direct flag and must be
separated by parent excitation energy. This importer explicitly selects ground
parents, and ~142.6836 keV for Tc-99m, rather than treating all `99tc` radiation
as Tc-99m. Raw rows without nuclear transition levels are excluded so appended
atomic radiation is not silently relabelled gamma. The source snapshots retain
all original rows to make the filtering auditable.

## ENSDF / NNDC

- ENSDF: https://www.nndc.bnl.gov/ensdf/
- ENSDF information: https://www.nndc.bnl.gov/ensdf/ensdf/ensdf-info.jsp
- NuDat: https://www.nndc.bnl.gov/nudat3/
- Citation guidance: https://www.nndc.bnl.gov/ensdf/citations.pdf

The production numbers are obtained through IAEA's specific exported snapshot;
this application does not falsely identify them as a fresh direct NNDC
extraction. Per-line evaluator/cutoff metadata and raw extraction dates remain
separate. With more than ten represented parent nuclides, NNDC recommends a
database citation; evaluators remain individually attributable in the records.

## Independent published photon-table spot checks

- LNHB / R. G. Helmer, Co-60 table, section 5.2:
  https://www.lnhb.fr/nuclides/Co-60_tables.pdf
- LNHB / S. Leblond, Cs-137 table, section 5.2; table cites X. Mougeot et al.,
  Metrologia 62 (2025) 029002:
  https://www.lnhb.fr/nuclides/Cs-137_tables.pdf

Co-60 photon energies 1173.228(3) and 1332.492(4) keV and photon yields
99.85(3)% and 99.9826(6)% agree with the selected IAEA rows. Use the photon
section, not the gamma-plus-conversion transition section.

The newer LNHB Cs-137 table lists 661.655(3) keV and 85.01(20)%, whereas the
bundled older IAEA/ENSDF evaluation lists 661.657(3) keV and 85.1(2)%.
This is a disclosed evaluation difference, not silently overwritten data. The
energies differ by 0.002 keV and yields by 0.09 percentage point. The production
library remains one reproducible IAEA export; the LNHB values are independent
review/test values only. These spot checks do not validate every transition
or provide an experimental identification benchmark. Publication PDFs are
linked, not redistributed.

## Uncertainty mathematics

JCGM 100:2008, Evaluation of measurement data - Guide to the expression of
uncertainty in measurement, section 5.2 on correlated input quantities:
https://www.bipm.org/documents/20126/2071204/JCGM_100_2008_E.pdf

The document is cited for the general covariance-propagation framework. Its
text, artwork and PDF are not republished. Project-defined identification
scores and heuristics are not claimed to be JCGM/IAEA validated procedures.

## Sources considered but not used numerically

NIST X-ray transition energies and CODATA were considered in scoping. This
release excludes X rays and does not calculate masses, recoil energies or
fundamental-constant conversions; therefore it does not claim that its gamma
library was obtained from NIST or import unrelated constants.

- https://physics.nist.gov/PhysRefData/XrayTrans/
- https://physics.nist.gov/constants

## Redistribution and attribution review

IAEA terms: https://nucleus.iaea.org/Pages/Others/Terms-Of-Use.aspx
The reviewed text distinguishes IAEA content, third-party content and digital
databases. Attribution and absence of implied endorsement are retained. No
bespoke blanket data license was found for this particular exported subset;
this project does not relabel it MIT. Retain `NOTICE.md`, the source metadata
and source-specific rights. Source PDFs and institutional logos are not
included. This records the reviewed provisions and remaining third-party
rights qualification; it does not assert a legal clearance beyond those terms.
