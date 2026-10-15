import type {Candidate,MatchResult,Mixture,Peak,Settings} from './types';
export function attributeMixtures(candidates:Candidate[],result:MatchResult,peaks:Peak[],s:Settings):{mixtures:Mixture[];truncated:boolean;searched:number}{
 const names=candidates.slice(0,12).map(c=>c.nuclide);const mixtures:Mixture[]=[];let searched=0;
 const peakCandidates=new Map(peaks.map(p=>[p.id,new Set<string>()]));
 for(const m of result.matches)peakCandidates.get(m.peakId)?.add(m.line.nuclide);
 function evaluate(chosen:string[]){
  searched++;
  const assignments=peaks.map(p=>({peakId:p.id,nuclides:chosen.filter(n=>peakCandidates.get(p.id)?.has(n))}));
  const explained=assignments.filter(a=>a.nuclides.length>0).map(a=>a.peakId);
  const gs=result.groups.filter(g=>g.peakIds.some(id=>explained.includes(id)));
  // Evidence groups count once; optional externally supplied weights, default 1.
  const weighted=gs.reduce((a,g)=>a+Math.max(...g.peakIds.map(id=>peaks.find(p=>p.id===id)?.weight??1)),0);
  const score=weighted-0.35*chosen.length;
  mixtures.push({nuclides:[...chosen],peakIds:explained,score,coverage:result.groups.length?gs.length/result.groups.length:0,unexplained:peaks.filter(p=>!explained.includes(p.id)).map(p=>p.id),assignments});
 }
 function walk(start:number,chosen:string[]){if(chosen.length)evaluate(chosen);if(chosen.length>=s.maxMixtureSize)return;for(let i=start;i<names.length;i++)walk(i+1,[...chosen,names[i]])}
 walk(0,[]);mixtures.sort((a,b)=>b.score-a.score||a.nuclides.length-b.nuclides.length||a.nuclides.join().localeCompare(b.nuclides.join()));
 return {mixtures:mixtures.slice(0,10),truncated:candidates.length>12,searched};
}
