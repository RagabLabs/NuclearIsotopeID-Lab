import type {Candidate,GammaLine,MatchResult,Settings} from './types';
import {eligibleLines} from './gammaDatabase';
export function analyzeAmbiguity(result:MatchResult,candidates:Candidate[],lines:GammaLine[],s:Settings){
 const shared=result.groups.flatMap(g=>{
  const ms=result.matches.filter(m=>g.peakIds.includes(m.peakId)),nuclides=[...new Set(ms.map(m=>m.line.nuclide))];
  return nuclides.length>1?[{groupId:g.id,peakIds:g.peakIds,nuclides,matches:ms}]:[];
 });
 const discriminating=candidates.map(c=>({nuclide:c.nuclide,lines:eligibleLines(lines,s).filter(l=>l.nuclide===c.nuclide&&!result.matches.some(m=>m.line.id===l.id)).filter(l=>!eligibleLines(lines,s).some(other=>other.nuclide!==c.nuclide&&Math.abs(other.energyKeV-l.energyKeV)<=Math.hypot(s.fallbackAbsoluteKeV,s.fallbackRelativePpm*l.energyKeV*1e-6))).sort((a,b)=>(b.emissionProbability??0)-(a.emissionProbability??0)).slice(0,5)}));
 return {shared,discriminating,note:'Suggested discriminating lines are separated under the declared fallback window only. Detectability and detector resolution must be checked; the database is incomplete.'};
}
