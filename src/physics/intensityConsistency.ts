import type {Candidate,Match,MatchResult,Peak,RatioResult,Settings} from './types';
import {correlatedRatioVariance,responseAt} from './uncertainty';
export function exclusiveAssignments(candidate:Candidate,result:MatchResult):Match[]{
 return candidate.assignments.filter(m=>{const g=result.groups.find(g=>g.peakIds.includes(m.peakId));return g?.peakIds.length===1&&new Set(result.matches.filter(x=>g.peakIds.includes(x.peakId)).map(x=>x.line.nuclide)).size===1});
}
export function intensityConsistency(candidate:Candidate,peaks:Peak[],result:MatchResult,s:Settings):{ratios:RatioResult[];warnings:string[]}{
 const usable=exclusiveAssignments(candidate,result).map(m=>({m,p:peaks.find(p=>p.id===m.peakId)!,r:responseAt(m.line.energyKeV,s)})).filter(x=>x.p.area!==undefined&&x.p.area>0&&x.r!==null&&(x.m.line.emissionProbability??0)>0).sort((a,b)=>b.p.area!-a.p.area!);
 const warnings:string[]=[];
 if(usable.length<2)return {ratios:[],warnings:['At least two isolated, non-shared peaks with net areas, absolute emission probabilities, and full-energy efficiency coverage are required. No raw-area vs emission-probability comparison is made.']};
 const anchor=usable[0];const ratios:RatioResult[]=[];
 for(const x of usable.slice(1)){
  const observed=x.p.area!/anchor.p.area!;
  const expected=x.m.line.emissionProbability!*x.r!.value*x.r!.summing/(anchor.m.line.emissionProbability!*anchor.r!.value*anchor.r!.summing);
  const areaKnown=x.p.areaUncertainty!==undefined&&anchor.p.areaUncertainty!==undefined;
  const obsRelVar=areaKnown?(x.p.areaUncertainty!/x.p.area!)**2+(anchor.p.areaUncertainty!/anchor.p.area!)**2:null;
  const expectedVariance=expectedRatioRelativeVariance(x.m,anchor.m,x.r!,anchor.r!,s);
  const lowCount=x.p.area!<25||anchor.p.area!<25||((x.p.areaUncertainty??0)/x.p.area!>0.3)||((anchor.p.areaUncertainty??0)/anchor.p.area!>0.3);
  const logResidual=Math.log(observed/expected);
  const v=obsRelVar!==null&&expectedVariance!==null?obsRelVar+expectedVariance:null;
  const z=v!==null&&v>0&&!lowCount&&s.summingAssumption!=='unassessed'?logResidual/Math.sqrt(v):null;
  ratios.push({line:x.m.line,anchor:anchor.m.line,observed,expected,observedUncertainty:obsRelVar===null?null:observed*Math.sqrt(obsRelVar),expectedUncertainty:expectedVariance===null?null:expected*Math.sqrt(expectedVariance),logResidual,z,assessment:lowCount?'Low-count or broad-error peak: ratio point estimate only; Gaussian residual withheld.':s.summingAssumption==='unassessed'?'Provisional: coincidence summing unassessed.':z===null?'Point estimate only: complete ratio uncertainties are unavailable.':Math.abs(z)>3?'Inconsistent under the stated detector and summing model.':'Compatible under the stated detector and summing model.'});
 }
 if(s.summingAssumption==='unassessed')warnings.push('Coincidence summing, self-attenuation, geometry, and matrix effects can distort ratios. No quantitative consistency classification is made until summing is assessed.');
 warnings.push('Emission-probability and summing-factor errors are treated as independent; their evaluation covariances are unavailable. Additional ratio-model uncertainty must be explicitly supplied for numerical residuals.');
 warnings.push('Ratios share the same anchor and are correlated. No independent-ratio chi-square is computed. Peak-area correlations are not supplied; overlapping peaks are excluded.');
 return {ratios,warnings};
}
export function expectedRatioRelativeVariance(a:Match,b:Match,ra:NonNullable<ReturnType<typeof responseAt>>,rb:NonNullable<ReturnType<typeof responseAt>>,s:Settings):number|null{
 const pa=a.line.emissionProbability,pb=b.line.emissionProbability,ua=a.line.emissionProbabilityUncertainty,ub=b.line.emissionProbabilityUncertainty;
 if(s.intensityModelRelativeUncertainty===undefined)return null;
 if(!pa||!pb||ua===null||ub===null||ra.relativeUncertainty===null||rb.relativeUncertainty===null||ra.summingRelativeUncertainty===null||rb.summingRelativeUncertainty===null)return null;
 return s.intensityModelRelativeUncertainty**2+(ua/pa)**2+(ub/pb)**2+correlatedRatioVariance(ra.relativeUncertainty,rb.relativeUncertainty,s.efficiencyCorrelation)+ra.summingRelativeUncertainty**2+rb.summingRelativeUncertainty**2;
}
