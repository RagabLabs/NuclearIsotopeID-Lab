import {describe,it,expect} from 'vitest';
import {matchGammaLines,assignIndependent} from './energyMatching';
import {rankCandidates} from './candidateRanking';
import {gammaLines} from './gammaDatabase';
import {line,peak,config} from './fixtures';
describe('01 • Energy-line matching against independent numerical expectations',()=>{
 it('matches exact published Co-60 energies without a fabricated isotope',()=>{const r=matchGammaLines([peak('p',1173.228)],gammaLines,config({energyMaxKeV:3500,minProbability:.01}));expect(r.matches.find(m=>m.line.nuclide==='Co-60')?.deltaKeV).toBe(0)});
 it('combines .3, .4 and .5 keV standard uncertainties to sqrt(.5)',()=>{const r=matchGammaLines([peak('p',100.6,{energyUncertaintyKeV:.3})],[line('r','Sim-A',100,.5,.4)],config({calibrationUncertaintyKeV:.5}));expect(r.matches[0].sigmaKeV).toBeCloseTo(Math.sqrt(.5),12);expect(r.matches[0].z).toBeCloseTo(.6/Math.sqrt(.5),12)});
 it('accepts a residual inside the stated k-sigma interval',()=>{expect(matchGammaLines([peak('p',100.29)],[line('r','Sim-A',100)],config()).matches).toHaveLength(1)});
 it('rejects a residual outside tolerance',()=>{expect(matchGammaLines([peak('p',100.31)],[line('r','Sim-A',100)],config()).matches).toHaveLength(0)});
 it('uses the declared energy-dependent window, with no invented z, for unknown centroid u',()=>{const r=matchGammaLines([peak('p',100.2,{energyUncertaintyKeV:undefined})],[line('r','Sim-A',100)],config({fallbackAbsoluteKeV:.3,fallbackRelativePpm:4000}));expect(r.matches[0].z).toBeNull();expect(r.matches[0].toleranceKeV).toBeCloseTo(Math.hypot(.3,.4008),12)});
 it('does not invent a reference uncertainty',()=>{const r=matchGammaLines([peak('p',100)],[line('r','Sim-A',100,.5,null)],config());expect(r.matches[0].basis).toBe('declared-window');expect(r.matches[0].z).toBeNull()});
 it('subtracts a declared known calibration offset',()=>{const r=matchGammaLines([peak('p',102)],[line('r','Sim-A',100)],config({calibrationOffsetKeV:2}));expect(r.matches[0].deltaKeV).toBe(0)});
 it('never identifies an out-of-range peak',()=>{expect(matchGammaLines([peak('p',5000)],[line('r','Sim-A',5000)],config()).matches).toHaveLength(0)});
 it('supports no isotope when there is no matching line',()=>{expect(rankCandidates(matchGammaLines([peak('p',888)],[line('r','Sim-A',100)],config()))).toEqual([])});
 it('collapses overlapping FWHM intervals into a single support group',()=>{const r=matchGammaLines([peak('a',100,{fwhmKeV:1}),peak('b',100.2,{fwhmKeV:1})],[line('r1','Sim-A',100),line('r2','Sim-A',100.2)],config());expect(r.groups).toHaveLength(1);expect(assignIndependent(r.matches,r.groups)).toHaveLength(1)});
 it('finds maximum-cardinality assignment where nearest-first greedy would miss a line',()=>{const r=matchGammaLines([peak('p1',100.1,{energyUncertaintyKeV:.1}),peak('p2',99.9,{energyUncertaintyKeV:.05})],[line('l1','Sim-A',100),line('l2','Sim-A',100.35)],config());const a=assignIndependent(r.matches,r.groups);expect(a).toHaveLength(2);expect(new Set(a.map(x=>x.peakId)).size).toBe(2)});
 it('does not reuse a single transition for two measured peaks',()=>{const r=matchGammaLines([peak('a',99.95),peak('b',100.05)],[line('r','Sim-A',100)],config());expect(assignIndependent(r.matches,r.groups)).toHaveLength(1)});
});
