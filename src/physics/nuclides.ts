import {database} from './gammaDatabase';
export const nuclides=database.nuclides.map(n=>n.nuclide);
export const nuclideNotes:Record<string,string>={
 'Cs-137':'661.657 keV is emitted by the short-lived Ba daughter level following Cs-137 decay. A single line cannot confirm the parent.',
 'Na-22':'511 keV annihilation radiation is excluded: it is not a unique nuclear gamma transition or a unique isotope signature.',
 'Tc-99m':'Only the ~142.6836 keV parent metastable state is selected; ground-state Tc-99 decay is excluded.',
 'Bi-214':'A daughter-series candidate. The parent chain is not inferred to be in radioactive equilibrium.',
 'Pb-214':'A daughter-series candidate. The parent chain is not inferred to be in radioactive equilibrium.',
};
