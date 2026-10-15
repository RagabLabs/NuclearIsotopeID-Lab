import type {GammaLine,Match,MatchResult,Peak,PeakGroup,Settings} from './types';
import {eligibleLines} from './gammaDatabase';
export function independentGroups(peaks:Peak[]):PeakGroup[]{
 const groups:PeakGroup[]=[];
 const sorted=[...peaks].sort((a,b)=>a.energyKeV-b.energyKeV);let right=-1;
 for(const p of sorted){
  const left=p.energyKeV-(p.fwhmKeV??0)/2,edge=p.energyKeV+(p.fwhmKeV??0)/2;
  if(groups.length&&left<right){groups[groups.length-1].peakIds.push(p.id);right=Math.max(right,edge)}
  else {groups.push({id:p.id,peakIds:[p.id]});right=edge}
 }return groups;
}
export function matchGammaLines(peaks:Peak[],lines:GammaLine[],s:Settings):MatchResult {
 const matches:Match[]=[];const warnings:string[]=[];
 for(const p of peaks){
  const e=p.energyKeV-s.calibrationOffsetKeV;
  if(e<s.energyMinKeV||e>s.energyMaxKeV){warnings.push(`${p.id}: outside the declared analysis range; retained as unexplained.`);continue}
  for(const line of eligibleLines(lines,s)){
   const complete=s.calibrationUncertaintyKnown&&p.energyUncertaintyKeV!==undefined&&line.energyUncertaintyKeV!==null;
   const sigma=complete?Math.hypot(p.energyUncertaintyKeV!,line.energyUncertaintyKeV!,s.calibrationUncertaintyKeV):null;
   const tolerance=sigma!==null?s.kSigma*sigma:Math.hypot(s.fallbackAbsoluteKeV,s.fallbackRelativePpm*e*1e-6);
   const delta=e-line.energyKeV;
   if(Math.abs(delta)<=tolerance+1e-12)matches.push({peakId:p.id,line,deltaKeV:delta,sigmaKeV:sigma,independentVarianceKeV2:complete?p.energyUncertaintyKeV!**2+line.energyUncertaintyKeV!**2:null,z:sigma!==null&&sigma>0?delta/sigma:null,toleranceKeV:tolerance,basis:complete?'uncertainty':'declared-window',incompleteUncertainty:!complete});
  }
 }
 const groups=independentGroups(peaks);
 if(!s.calibrationUncertaintyKnown)warnings.push('Calibration uncertainty has not been supplied or explicitly assessed. No total-energy z scores are reported.');
 if(peaks.some(p=>p.energyUncertaintyKeV===undefined))warnings.push('Some centroid uncertainties are missing. Declared energy-dependent windows are used; their residuals are not statistical z scores.');
 if(groups.some(g=>g.peakIds.length>1))warnings.push('Overlapping FWHM intervals are one evidence group. A resolved-peak fit would be needed to count them independently.');
 return {matches:matches.sort((a,b)=>a.line.energyKeV-b.line.energyKeV),groups,warnings};
}
/** Maximum-cardinality bipartite matching: one unresolved measured group and one reference transition per support. */
export function assignIndependent(matches:Match[],groups:PeakGroup[]):Match[]{
 const adjacency=new Map<string,Match[]>();
 for(const g of groups){const ms=matches.filter(m=>g.peakIds.includes(m.peakId)).sort((a,b)=>Math.abs(a.z??a.deltaKeV/a.toleranceKeV)-Math.abs(b.z??b.deltaKeV/b.toleranceKeV));adjacency.set(g.id,ms)}
 const used=new Map<string,{group:string;match:Match}>();
 function augment(group:string,seen:Set<string>):boolean{
  for(const m of adjacency.get(group)??[]){
   const key=m.line.id;if(seen.has(key))continue;seen.add(key);
   const prior=used.get(key);
   if(!prior||augment(prior.group,seen)){used.set(key,{group,match:m});return true}
  }return false;
 }
 for(const g of groups)augment(g.id,new Set());
 return [...used.values()].map(x=>x.match).sort((a,b)=>a.line.energyKeV-b.line.energyKeV);
}
