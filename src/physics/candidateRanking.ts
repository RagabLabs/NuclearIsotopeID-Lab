import type {Candidate,MatchResult} from './types';
import {assignIndependent} from './energyMatching';
export function rankCandidates(result:MatchResult):Candidate[]{
 const names=[...new Set(result.matches.map(m=>m.line.nuclide))];
 return names.map(n=>{
  const assignments=assignIndependent(result.matches.filter(m=>m.line.nuclide===n),result.groups);
  const uniqueLines=assignments.filter(m=>{const g=result.groups.find(g=>g.peakIds.includes(m.peakId))!;return new Set(result.matches.filter(x=>g.peakIds.includes(x.peakId)).map(x=>x.line.nuclide)).size===1}).length;
  const weights=assignments.map(m=>Math.exp(-0.5*(m.z??(safediv(m.deltaKeV,m.toleranceKeV)*3))**2));
  const quality=weights.reduce((a,b)=>a+b,0)/(weights.length||1);
  // Open scoring rule, points per independently supported group; intentionally not a probability.
  const score=assignments.length*10+uniqueLines*3+quality*2;
  return {nuclide:n,assignments,independentLines:assignments.length,uniqueLines,score,energyQuality:quality,missingCount:0,explanation:`10 × ${assignments.length} independent support + 3 × ${uniqueLines} exclusive groups + 2 × ${quality.toFixed(3)} energy agreement. Missing-line contradictions are evaluated separately.`};
 }).sort((a,b)=>b.score-a.score||a.nuclide.localeCompare(b.nuclide));
}
function safediv(a:number,b:number){return b>0?a/b:0}
