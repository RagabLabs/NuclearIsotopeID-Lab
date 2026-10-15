import type {Candidate,GammaLine,Match,MatchResult,MissingLine,Peak,Settings} from './types';
import {eligibleLines} from './gammaDatabase';
import {responseAt} from './uncertainty';
import {exclusiveAssignments,expectedRatioRelativeVariance} from './intensityConsistency';
export function analyzeMissingLines(candidate:Candidate,peaks:Peak[],result:MatchResult,lines:GammaLine[],s:Settings):MissingLine[]{
 const anchors=exclusiveAssignments(candidate,result).filter(m=>{const p=peaks.find(p=>p.id===m.peakId)!;return p.area!==undefined&&p.area>=25&&p.areaUncertainty!==undefined&&p.areaUncertainty/p.area<=0.3&&responseAt(m.line.energyKeV,s)!==null&&(m.line.emissionProbability??0)>0}).sort((a,b)=>peaks.find(p=>p.id===b.peakId)!.area!-peaks.find(p=>p.id===a.peakId)!.area!);
 const anchor=anchors[0],ap=anchor?peaks.find(p=>p.id===anchor.peakId)!:null;
 return eligibleLines(lines,s).filter(l=>l.nuclide===candidate.nuclide).map(line=>{
  if(result.matches.some(m=>m.line.id===line.id))return {line,state:'observed',expectedCounts:null,uncertainty:null,lowerCounts:null,reason:'Energy-compatible observed peak; shared assignments are not proof of this nuclide.'};
  const basic={line,expectedCounts:null,uncertainty:null,lowerCounts:null};
  if(!s.peakListComplete||s.detectionThresholdCounts===undefined||s.summingAssumption==='unassessed'||!anchor||!ap)return {...basic,state:'not-assessable',reason:'Quantitative absence needs a complete peak list, a declared count threshold, assessed summing, and an isolated high-count anchor with uncertainty.'};
  const r=responseAt(line.energyKeV,s),ar=responseAt(anchor.line.energyKeV,s);
  if(!r||!ar||!line.emissionProbability)return {...basic,state:'not-assessable',reason:'Reference probability or detector-efficiency coverage is missing. No extrapolation is used.'};
  const pseudo:Match={...anchor,line};
  const vr=expectedRatioRelativeVariance(pseudo,anchor,r,ar,s);
  if(vr===null)return {...basic,state:'not-assessable',reason:'Reference, efficiency, summing, or additional response-model uncertainties are incomplete.'};
  const expected=ap.area!*line.emissionProbability*r.value*r.summing/(anchor.line.emissionProbability!*ar.value*ar.summing);
  const uncertainty=expected*Math.sqrt(vr+(ap.areaUncertainty!/ap.area!)**2);
  const lower=Math.max(0,expected-s.kSigma*uncertainty);
  const state=lower>s.detectionThresholdCounts?'expected-not-seen':'below-sensitivity';
  return {line,state,expectedCounts:expected,uncertainty,lowerCounts:lower,reason:state==='expected-not-seen'?'Conditional contradiction: conservative expected-count bound exceeds the user threshold; assumes a pure anchor and the stated response.':'The conservative expected-count bound does not exceed the detection threshold. Absence is not adverse evidence.'};
 });
}
