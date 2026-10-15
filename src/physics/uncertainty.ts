import type {EfficiencyPoint,Settings} from './types';
export interface Response {value:number;relativeUncertainty:number|null;summing:number;summingRelativeUncertainty:number|null}
export function efficiencyAt(e:number,points:EfficiencyPoint[]):{value:number;relativeUncertainty:number|null;point:EfficiencyPoint}|null {
 const ps=[...points].sort((a,b)=>a.energyKeV-b.energyKeV);
 const exact=ps.find(p=>Math.abs(p.energyKeV-e)<1e-7);
 if(exact)return {value:exact.efficiency,relativeUncertainty:exact.uncertainty===undefined?null:exact.uncertainty/exact.efficiency,point:exact};
 const i=ps.findIndex(p=>p.energyKeV>e);if(i<=0)return null;
 const a=ps[i-1],b=ps[i],t=Math.log(e/a.energyKeV)/Math.log(b.energyKeV/a.energyKeV);
 const value=Math.exp((1-t)*Math.log(a.efficiency)+t*Math.log(b.efficiency));
 // Conservative fully correlated endpoint relative uncertainty, no artificial gain from interpolation.
 const relativeUncertainty=a.uncertainty===undefined||b.uncertainty===undefined?null:(1-t)*a.uncertainty/a.efficiency+t*b.uncertainty/b.efficiency;
 const summingFactor=a.summingFactor===undefined||b.summingFactor===undefined?undefined:(1-t)*a.summingFactor+t*b.summingFactor;
 const summingUncertainty=a.summingUncertainty===undefined||b.summingUncertainty===undefined?undefined:(1-t)*a.summingUncertainty+t*b.summingUncertainty;
 return {value,relativeUncertainty,point:{energyKeV:e,efficiency:value,summingFactor,summingUncertainty}};
}
export function responseAt(e:number,s:Settings):Response|null{
 const eff=efficiencyAt(e,s.efficiency);if(!eff)return null;
 const corrected=s.summingAssumption==='corrected';
 if(corrected&&eff.point.summingFactor===undefined)return null;
 return {value:eff.value,relativeUncertainty:eff.relativeUncertainty,summing:corrected?eff.point.summingFactor!:1,summingRelativeUncertainty:corrected?(eff.point.summingUncertainty===undefined?null:eff.point.summingUncertainty/eff.point.summingFactor!):0};
}
export function correlatedRatioVariance(a:number,b:number,rho:number){return Math.max(0,a*a+b*b-2*rho*a*b)}
export function gaussianCommonOffset(residuals:number[],variances:number[],commonSigma:number):{chiSquare:number;logDeterminant:number}|null{
 if(!residuals.length||residuals.length!==variances.length||variances.some(v=>!Number.isFinite(v)||v<=0))return null;
 const w=variances.map(v=>1/v),sumW=w.reduce((a,b)=>a+b,0),weightedR=residuals.reduce((a,r,i)=>a+r*w[i],0),c2=commonSigma**2;
 return {chiSquare:Math.max(0,residuals.reduce((a,r,i)=>a+r*r*w[i],0)-c2*weightedR**2/(1+c2*sumW)),logDeterminant:variances.reduce((a,v)=>a+Math.log(v),0)+Math.log1p(c2*sumW)};
}
export function logSumExp(values:number[]):number {const m=Math.max(...values);return m+Math.log(values.reduce((a,v)=>a+Math.exp(v-m),0))}
