import {describe,it,expect} from 'vitest';
import {gammaLines} from './gammaDatabase';
describe('Independent published photon-data spot checks and parent identity',()=>{
 // LNHB Co-60 tables, section 5.2, photon emissions (not transition spacings):
 // https://www.lnhb.fr/nuclides/Co-60_tables.pdf. Reviewed 2026-10-15.
 it.each([
  {energy:1173.228,uncertainty:.003,probability:.9985,probabilityU:.0003},
  {energy:1332.492,uncertainty:.004,probability:.999826,probabilityU:.000006},
 ])('matches the independent Co-60 photon record at $energy keV',r=>{
  const actual=gammaLines.find(l=>l.nuclide==='Co-60'&&l.energyKeV===r.energy)!;
  expect(actual).toBeDefined();expect(actual.energyUncertaintyKeV).toBe(r.uncertainty);expect(actual.emissionProbability).toBeCloseTo(r.probability,12);expect(actual.emissionProbabilityUncertainty).toBeCloseTo(r.probabilityU,12);
  expect(actual.startLevelKeV!-actual.endLevelKeV!).not.toBeCloseTo(actual.energyKeV,4);
 });
 it('keeps Tc-99m parent-state radiation separate from ground-state Tc-99',()=>{const lines=gammaLines.filter(l=>l.nuclide==='Tc-99m');expect(lines.length).toBeGreaterThan(0);expect(lines.every(l=>Math.abs(l.parentLevelKeV-142.6836)<1e-6)).toBe(true)});
 it('does not use the non-specific 511 keV annihilation peak as a Na-22 nuclear fingerprint',()=>{const lines=gammaLines.filter(l=>l.nuclide==='Na-22');expect(lines).toHaveLength(1);expect(lines[0].energyKeV).toBe(1274.537);expect(lines.some(l=>l.energyKeV===511)).toBe(false)});
});
