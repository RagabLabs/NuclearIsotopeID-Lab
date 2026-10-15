import {describe,it,expect} from 'vitest';
import {matchGammaLines} from './energyMatching';
import {rankCandidates} from './candidateRanking';
import {multilineConsistency} from './multilineConsistency';
import {analyzeAmbiguity} from './ambiguity';
import {evidenceCoverage} from './evidenceCoverage';
import {attributeMixtures} from './mixtureAttribution';
import {lines,line,peak,config} from './fixtures';
describe('02 • Candidate ranking',()=>{
 it('ranks two independent lines above one single-line match',()=>{const r=matchGammaLines([peak('p',100),peak('q',200)],lines,config());expect(rankCandidates(r)[0].nuclide).toBe('Sim-A');expect(rankCandidates(r)[0].independentLines).toBe(2)});
 it('evidence points are not bounded probabilities',()=>{const r=matchGammaLines([peak('p',100),peak('q',200)],[line('x','Sim-A',100),line('y','Sim-A',200)],config());expect(rankCandidates(r)[0].score).toBe(28)});
 it('keeps both candidates for a shared single line',()=>{const cs=rankCandidates(matchGammaLines([peak('p',100.05)],lines,config()));expect(cs.map(c=>c.nuclide)).toEqual(expect.arrayContaining(['Sim-A','Sim-B']))});
});
describe('03 • Multi-line Gaussian centroid consistency',()=>{
 it('includes off-diagonal shared calibration covariance: expected chi-square 2/3',()=>{const s=config({calibrationUncertaintyKeV:1});const r=matchGammaLines([peak('p',101,{energyUncertaintyKeV:1}),peak('q',201,{energyUncertaintyKeV:1})],[line('x','Sim-A',100),line('y','Sim-A',200)],s);const c=rankCandidates(r)[0];const stat=multilineConsistency(c.assignments,s);expect(stat.chiSquare).toBeCloseTo(2/3,12);expect(stat.degreesOfFreedom).toBe(2)});
 it('differential residuals are not removed by common-mode calibration',()=>{const s=config({calibrationUncertaintyKeV:1});const r=matchGammaLines([peak('p',101,{energyUncertaintyKeV:1}),peak('q',199,{energyUncertaintyKeV:1})],[line('x','Sim-A',100),line('y','Sim-A',200)],s);expect(multilineConsistency(rankCandidates(r)[0].assignments,s).chiSquare).toBeCloseTo(2,12)});
 it('withholds statistics for incomplete uncertainties',()=>{const s=config();const r=matchGammaLines([peak('p',100,{energyUncertaintyKeV:undefined})],lines,s);expect(multilineConsistency(rankCandidates(r)[0].assignments,s).chiSquare).toBeNull()});
});
describe('05 • Shared-line ambiguity',()=>{
 it('retains alternative parents and their potential discriminating lines',()=>{const s=config();const r=matchGammaLines([peak('p',100.05)],lines,s),a=analyzeAmbiguity(r,rankCandidates(r),lines,s);expect(a.shared[0].nuclides).toEqual(expect.arrayContaining(['Sim-A','Sim-B']));expect(a.discriminating.find(d=>d.nuclide==='Sim-B')?.lines[0].energyKeV).toBe(300)});
 it('counts one shared group even for overlapping reported centroids',()=>{const s=config();const r=matchGammaLines([peak('p',100,{fwhmKeV:2}),peak('q',100.1,{fwhmKeV:2})],lines,s);expect(analyzeAmbiguity(r,rankCandidates(r),lines,s).shared).toHaveLength(1)});
});
describe('07 • Bounded mixed-isotope attribution',()=>{
 it('finds a two-component explanation of independent line families',()=>{const s=config({maxMixtureSize:2});const ps=[peak('p',200),peak('q',300),peak('u',888)];const r=matchGammaLines(ps,lines,s),m=attributeMixtures(rankCandidates(r),r,ps,s);expect(m.mixtures[0].nuclides.sort()).toEqual(['Sim-A','Sim-B']);expect(m.mixtures[0].unexplained).toEqual(['u']);expect(m.mixtures[0].coverage).toBeCloseTo(2/3)});
 it('keeps tied alternative explanations rather than selecting one as proven',()=>{const s=config();const ps=[peak('p',100.05)],r=matchGammaLines(ps,lines,s);const m=attributeMixtures(rankCandidates(r),r,ps,s);expect(m.mixtures.filter(m=>m.nuclides.length===1)).toHaveLength(2);expect(m.mixtures[0].score).toBeCloseTo(m.mixtures[1].score)});
 it('does not infer activities from compatible line families',()=>{const s=config(),ps=[peak('p',200)],r=matchGammaLines(ps,lines,s);expect(attributeMixtures(rankCandidates(r),r,ps,s).mixtures[0]).not.toHaveProperty('activity')});
});
describe('08 • Coverage denominators and group weighting',()=>{
 it('separates peak fraction 1/2, externally weighted coverage 3/4, and listed area 1/10',()=>{const ps=[peak('p',100,{area:10,weight:3}),peak('q',200,{area:90,weight:1})];const c=evidenceCoverage(ps,['p'],[{id:'p',peakIds:['p']},{id:'q',peakIds:['q']}]);expect(c.peakFraction).toBe(.5);expect(c.weightedCoverage).toBe(.75);expect(c.listedNetAreaFraction).toBe(.1)});
 it('counts overlapping evidence once using the maximum provided group weight',()=>{const ps=[peak('p',100,{weight:4}),peak('q',100.1,{weight:7}),peak('r',200,{weight:3})];const c=evidenceCoverage(ps,['p'],[{id:'a',peakIds:['p','q']},{id:'b',peakIds:['r']}]);expect(c.weightedCoverage).toBe(.7);expect(c.totalIndependentGroups).toBe(2)});
 it('withholds the listed-area fraction if any area is unknown',()=>{expect(evidenceCoverage([peak('p',100)],['p'],[{id:'a',peakIds:['p']}]).listedNetAreaFraction).toBeNull()});
 it('returns finite zeros for an empty evidence set',()=>{const c=evidenceCoverage([],[],[]);expect(c.peakFraction).toBe(0);expect(c.weightedCoverage).toBe(0)});
});
