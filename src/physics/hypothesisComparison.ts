import type {GammaLine,Hypothesis,Peak,Settings} from './types';
import {eligibleLines} from './gammaDatabase';
import {independentGroups} from './energyMatching';
import {logSumExp} from './uncertainty';
/** Explicit energy-centroid density model. Equal line weights, fixed uniform clutter,
 * common Gaussian calibration nuisance integrated by quadrature. No count chi-square.
 * This is not a validated presence probability, Bayes factor, or isotope abundance model. */
export function compareHypotheses(hypotheses:string[][],peaks:Peak[],lines:GammaLine[],s:Settings):Hypothesis[]{
 const groups=independentGroups(peaks);
 const independent=groups.map(g=>peaks.find(p=>p.id===g.peakIds[0])!);
 const rows:Hypothesis[]=hypotheses.map(nuclides=>{
  const refs=eligibleLines(lines,s).filter(l=>nuclides.includes(l.nuclide));
  const base={nuclides,lineCount:refs.length,logLikelihood:null,deltaDeviance:null,relativeLikelihood:null};
  if(nuclides.some(n=>!lines.some(l=>l.nuclide===n)))return {...base,status:'Unknown nuclide: hypothesis is outside this reference library.'};
  if(!s.calibrationUncertaintyKnown)return {...base,status:'Unavailable: calibration uncertainty has not been supplied or explicitly assessed.'};
  if(!independent.length||groups.some(g=>g.peakIds.length>1)||independent.some(p=>p.energyUncertaintyKeV===undefined||p.energyKeV-s.calibrationOffsetKeV<s.energyMinKeV||p.energyKeV-s.calibrationOffsetKeV>s.energyMaxKeV))return {...base,status:'Unavailable: complete centroid uncertainties, in-range energies, and non-overlapping peaks are required for comparable models.'};
  if(refs.some(l=>l.energyUncertaintyKeV===null))return {...base,status:'Unavailable: this hypothesis contains reference lines with missing energy uncertainties. Tighten the probability filter or use qualitative evidence.'};
  const unique=refs.filter((l,i)=>refs.findIndex(r=>r.energyKeV===l.energyKeV&&r.energyUncertaintyKeV===l.energyUncertaintyKeV)===i);
  const width=s.energyMaxKeV-s.energyMinKeV;
  const conditional=(offset:number)=>independent.reduce((acc,p)=>{
   const energy=p.energyKeV-s.calibrationOffsetKeV-offset;
   const lineTerms=unique.map(l=>{
    const variance=p.energyUncertaintyKeV!**2+l.energyUncertaintyKeV!**2;
    return -0.5*((energy-l.energyKeV)**2/variance+Math.log(2*Math.PI*variance))+Math.log(s.inlierFraction/unique.length);
   });
   return acc+logSumExp([Math.log((unique.length?1-s.inlierFraction:1)/width),...lineTerms]);
  },0);
  let ll:number;
  if(s.calibrationUncertaintyKeV===0)ll=conditional(0);
  else {
   // Composite midpoint quadrature over ±6 sigma; Gaussian prior mass outside is <2e-9.
   // Adaptive step also resolves the narrowest centroid density; at most 12001 nodes.
   const narrow=Math.min(...independent.map(p=>p.energyUncertaintyKeV!));
   let nodes=Math.max(121,Math.ceil(72*s.calibrationUncertaintyKeV/narrow));
   if(nodes>12001)return {...base,status:'Unavailable: calibration/centroid scale ratio exceeds the bounded quadrature resolution.'};
   nodes=Math.ceil(nodes);if(nodes*independent.length*Math.max(1,unique.length)>5_000_000)return {...base,status:'Unavailable: requested nuisance integration exceeds the bounded computation budget. Narrow the reference range or probability filter.'};
   const step=12/nodes;
   const terms=Array.from({length:nodes},(_,i)=>{const z=-6+(i+0.5)*step;return conditional(z*s.calibrationUncertaintyKeV)-z*z/2-0.5*Math.log(2*Math.PI)+Math.log(step)});
   ll=logSumExp(terms);
  }
  return {...base,logLikelihood:ll,status:'Conditional centroid density; line-selection, database coverage, and fixed clutter assumptions limit interpretation.'};
 });
 const valid=rows.filter(r=>r.logLikelihood!==null);const best=valid.length?Math.max(...valid.map(r=>r.logLikelihood!)):null;
 return rows.map(r=>{
  if(r.logLikelihood===null||best===null)return r;
  const delta=Math.max(0,2*(best-r.logLikelihood));
  const near=valid.filter(h=>2*(best-h.logLikelihood!)<=2).length;
  const interpretation=valid.length<2?'Only one valid model; relative comparison is unavailable':delta<=2&&near>1?'Inconclusive among near-equal alternatives':delta===0?'Preferred under the stated conditional model':'Less supported under the stated conditional model';
  return {...r,deltaDeviance:delta,relativeLikelihood:Math.exp(Math.max(-745,r.logLikelihood-best)),status:`${interpretation}. ${r.status}`};
 }).sort((a,b)=>(a.deltaDeviance??1e100)-(b.deltaDeviance??1e100));
}
