import type {Peak,PeakGroup} from './types';
export function evidenceCoverage(peaks:Peak[],explainedIds:string[],groups:PeakGroup[]){
 const explained=new Set(explainedIds);
 const n=peaks.filter(p=>explained.has(p.id)).length;
 const weight=(ids:string[])=>Math.max(...ids.map(id=>peaks.find(p=>p.id===id)?.weight??1));
 const totalWeight=groups.reduce((a,g)=>a+weight(g.peakIds),0);
 const explainedWeight=groups.filter(g=>g.peakIds.some(id=>explained.has(id))).reduce((a,g)=>a+weight(g.peakIds),0);
 const groupsExplained=groups.filter(g=>g.peakIds.some(id=>explained.has(id))).length;
 const allAreas=peaks.length>0&&peaks.every(p=>p.area!==undefined);
 const totalArea=allAreas?peaks.reduce((a,p)=>a+p.area!,0):0;
 return {totalPeaks:peaks.length,explainedPeaks:n,peakFraction:peaks.length?n/peaks.length:0,unexplainedPeakFraction:peaks.length?1-n/peaks.length:0,totalIndependentGroups:groups.length,explainedGroups:groupsExplained,groupFraction:groups.length?groupsExplained/groups.length:0,weightedCoverage:totalWeight?explainedWeight/totalWeight:0,listedNetAreaFraction:allAreas&&totalArea>0?peaks.filter(p=>explained.has(p.id)).reduce((a,p)=>a+p.area!,0)/totalArea:null,note:'Coverage is not an identification probability. Listed net peak areas exclude continuum and all unlisted counts; they do not measure the fraction of total spectrum counts.'};
}
