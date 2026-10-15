# Data and third-party notices

The original application source is MIT-licensed. This does **not** relicense
IAEA / ENSDF reference data, source snapshots, or third-party packages.

Nuclear data were obtained from the IAEA LiveChart data-download API on
2026-10-14. The LiveChart API guide identifies an April 2022 ENSDF snapshot;
individual rows retain the evaluation authors, publication cutoff, and actual
extraction date. These three dates are different concepts. No claim is made
that this is the latest ENSDF evaluation.

Acknowledge **IAEA Nuclear Data Section, LiveChart of Nuclides, and the
Evaluated Nuclear Structure Data File (ENSDF), maintained by NNDC with the
international nuclear-structure and decay-data evaluation network**.
Per-line evaluators and source URLs are in the database. The API retrieval date
must not replace the earlier evaluation dates in scientific citations.

IAEA terms reviewed: https://nucleus.iaea.org/Pages/Others/Terms-Of-Use.aspx
Their IAEA-content provisions permit reuse with attribution and no implied
endorsement, subject to material-specific restrictions. They separately
reserve third-party rights and describe educational/informational database
access. This project does not assert an unrestricted open-data license for
ENSDF-derived material or establish third-party rights on the user's behalf.
Retain the source notices and consult the source terms for new uses.

ENSDF citation guidance: https://www.nndc.bnl.gov/ensdf/citations.pdf
More than ten parent nuclides are represented; cite the database plus this
fixed, traceable snapshot and its per-line evaluation metadata.

There is no IAEA, NNDC, BIPM, LNHB, or GitHub endorsement. No source logos,
source publication PDFs, or institutional branding are redistributed.
Dependencies retain their notices in their distributed packages and bundles.

The `Sim-A`, `Sim-B`, and `Sim-C` records in test fixtures are explicitly
analytical simulations, not nuclides or production reference records. The
example peak lists and example detector efficiencies are also simulated.

PDF exports embed the unmodified DejaVu Sans font. Its Bitstream Vera / DejaVu
notices are retained in `docs/DEJAVU_FONT_LICENSE.txt`; that font is not relicensed
MIT. DejaVu changes are public domain as stated in its upstream notice.
