import {describe,it,expect} from 'vitest';
import {matchGammaLines} from './energyMatching';
import {rankCandidates} from './candidateRanking';
import {analyzeMissingLines} from './missingLines';
import {intensityConsistency} from './intensityConsistency';
import {efficiencyAt} from './uncertainty';
import {line,peak,config,highResponse} from './fixtures';
import type {Peak,Settings} from './types';
const ls=[line('x','Sim-A',100,.5),line('y','Sim-A',200,.25)];
function result(ps:Peak[],s:Settings=highResponse){const m=matchGammaLines(ps,ls,s);return {m,c:rankCandidates(m)[0]}}
describe('04 • Missing expected gamma lines',()=>{
 it('predicts 1000 counts from 1000×(.25×.2)/(.5×.1), and flags an unobserved detectable line',()=>{const ps=[peak('p',100,{area:1000,areaUncertainty:32})],{m,c}=result(ps);const miss=analyzeMissingLines(c,ps,m,ls,highResponse).find(x=>x.line.energyKeV===200)!;expect(miss.expectedCounts).toBeCloseTo(1000,12);expect(miss.state).toBe('expected-not-seen');expect(miss.lowerCounts).toBeGreaterThan(20)});
 it('does not penalize absence under insufficient sensitivity',()=>{const s={...highResponse,detectionThresholdCounts:2000};const ps=[peak('p',100,{area:1000,areaUncertainty:32})],{m,c}=result(ps,s);expect(analyzeMissingLines(c,ps,m,ls,s)[1].state).toBe('below-sensitivity')});
 it.each([{...highResponse,efficiency:[]},{...highResponse,peakListComplete:false},{...highResponse,detectionThresholdCounts:undefined},{...highResponse,summingAssumption:'unassessed' as const}])('limits absence claims if the response or sensitivity model is incomplete',s=>{const ps=[peak('p',100,{area:1000,areaUncertainty:32})],{m,c}=result(ps,s);expect(analyzeMissingLines(c,ps,m,ls,s)[1].state).toBe('not-assessable')});
 it('does not use a shared peak as a pure intensity anchor',()=>{const shared=[...ls,line('b','Sim-B',100)],ps=[peak('p',100,{area:1000,areaUncertainty:32})],m=matchGammaLines(ps,shared,highResponse),c=rankCandidates(m).find(c=>c.nuclide==='Sim-A')!;expect(analyzeMissingLines(c,ps,m,shared,highResponse)[1].state).toBe('not-assessable')});
 it('does not infer absence from a low-count anchor',()=>{const ps=[peak('p',100,{area:4,areaUncertainty:2})],{m,c}=result(ps);expect(analyzeMissingLines(c,ps,m,ls,highResponse)[1].state).toBe('not-assessable')});
});
describe('06 • Relative gamma intensity with detector response',()=>{
 it('corrects a raw equal-area ratio for a 2× efficiency difference and predicts a ratio of 1',()=>{const ps=[peak('p',100,{area:1000,areaUncertainty:32}),peak('q',200,{area:1000,areaUncertainty:32})],{m,c}=result(ps);const rr=intensityConsistency(c,ps,m,highResponse).ratios[0];expect(rr.observed).toBe(1);expect(rr.expected).toBe(1);expect(rr.z).toBe(0)});
 it('propagates a shared efficiency correlation without double-counting it',()=>{const ps=[peak('p',100,{area:1000,areaUncertainty:32}),peak('q',200,{area:1000,areaUncertainty:32})];const {m,c}=result(ps);const a=intensityConsistency(c,ps,m,highResponse).ratios[0],b=intensityConsistency(c,ps,m,{...highResponse,efficiencyCorrelation:1}).ratios[0];expect(a.expectedUncertainty).toBeCloseTo(Math.sqrt(.0002));expect(b.expectedUncertainty).toBeCloseTo(0)});
 it('does not compare raw areas to emission probabilities when efficiency is absent',()=>{const s=config();const ps=[peak('p',100,{area:1000}),peak('q',200,{area:1000})],{m,c}=result(ps,s);expect(intensityConsistency(c,ps,m,s).ratios).toEqual([])});
 it('withholds the Gaussian ratio residual for low-count net areas',()=>{const ps=[peak('p',100,{area:4,areaUncertainty:2}),peak('q',200,{area:4,areaUncertainty:2})],{m,c}=result(ps);expect(intensityConsistency(c,ps,m,highResponse).ratios[0].z).toBeNull()});
 it('withholds quantitative ratio assessment when summing is unassessed',()=>{const ps=[peak('p',100,{area:1000,areaUncertainty:32}),peak('q',200,{area:1000,areaUncertainty:32})],{m,c}=result(ps);expect(intensityConsistency(c,ps,m,{...highResponse,summingAssumption:'unassessed'}).ratios[0].z).toBeNull()});
 it('does not invent a missing emission uncertainty',()=>{const altered=ls.map(l=>({...l,emissionProbabilityUncertainty:null}));const ps=[peak('p',100,{area:1000,areaUncertainty:32}),peak('q',200,{area:1000,areaUncertainty:32})],m=matchGammaLines(ps,altered,highResponse),c=rankCandidates(m)[0];expect(intensityConsistency(c,ps,m,highResponse).ratios[0].expectedUncertainty).toBeNull()});
 it('does not extrapolate detector efficiencies',()=>{expect(efficiencyAt(19,highResponse.efficiency)).toBeNull();expect(efficiencyAt(1500,highResponse.efficiency)).toBeNull()});
 it('uses log-log interpolation between two provided points',()=>{expect(efficiencyAt(200,[{energyKeV:100,efficiency:.1},{energyKeV:400,efficiency:.4}])?.value).toBeCloseTo(.2,12)});
});
