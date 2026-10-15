import type {GammaLine,Peak,Settings} from './types';
export const defaultSettings:Settings={kSigma:3,calibrationUncertaintyKnown:false,calibrationUncertaintyKeV:0,calibrationOffsetKeV:0,fallbackAbsoluteKeV:0.4,fallbackRelativePpm:800,minProbability:0.001,energyMinKeV:20,energyMaxKeV:3500,efficiency:[],efficiencyCorrelation:0,summingAssumption:'unassessed',peakListComplete:false,maxMixtureSize:3,inlierFraction:0.9};
const finite=(v:unknown):v is number=>typeof v==='number'&&Number.isFinite(v);
export function validatePeaks(peaks:Peak[]):string[]{
 const errors:string[]=[];
 if(!Array.isArray(peaks)||!peaks.length)return ['Enter at least one measured peak.'];
 if(peaks.length>200)errors.push('At most 200 peaks are supported per analysis.');
 const ids=new Set<string>();const energies:number[]=[];
 peaks.forEach((p,i)=>{
  const row=`Peak ${i+1}`;
  if(!p.id||ids.has(p.id))errors.push(`${row}: peak identifiers must be unique.`);ids.add(p.id);
  if(!finite(p.energyKeV)||p.energyKeV<=0||p.energyKeV>1e7)errors.push(`${row}: energy must be finite and positive.`);
  if(energies.some(e=>Math.abs(e-p.energyKeV)<1e-7))errors.push(`${row}: duplicate peak energy; merge duplicate records first.`);energies.push(p.energyKeV);
  for(const key of ['energyUncertaintyKeV','areaUncertainty','fwhmKeV','measurementTimeSec','weight'] as const){if(p[key]!==undefined&&(!finite(p[key])||p[key]!<=0))errors.push(`${row}: ${key} must be positive when supplied.`)}
  if(p.energyUncertaintyKeV!==undefined&&(p.energyUncertaintyKeV<1e-9||p.energyUncertaintyKeV>1000))errors.push(`${row}: centroid uncertainty must lie within 1e-9–1000 keV.`);
  for(const key of ['area','areaUncertainty','fwhmKeV','measurementTimeSec','weight'] as const)if(p[key]!==undefined&&p[key]!>1e15)errors.push(`${row}: ${key} exceeds the numerical limit 1e15.`);
  if(p.area!==undefined&&(!finite(p.area)||p.area<0||(p.area>0&&p.area<1e-9)))errors.push(`${row}: net peak area must be finite and non-negative.`);
 });return errors;
}
export function validateSettings(s:Settings):string[]{
 const e:string[]=[];
 for(const key of ['kSigma','fallbackAbsoluteKeV','fallbackRelativePpm','energyMinKeV','energyMaxKeV','minProbability','calibrationUncertaintyKeV','calibrationOffsetKeV','efficiencyCorrelation','inlierFraction','maxMixtureSize'] as const)if(!finite(s[key]))e.push(`${key} must be finite.`);
 if(s.kSigma<=0||s.kSigma>10)e.push('Matching k must be in (0,10].');
 if(s.calibrationUncertaintyKeV<0||s.calibrationUncertaintyKeV>1000)e.push('Calibration uncertainty must lie within 0–1000 keV.');
 if(s.intensityModelRelativeUncertainty!==undefined&&(!finite(s.intensityModelRelativeUncertainty)||s.intensityModelRelativeUncertainty<0||s.intensityModelRelativeUncertainty>10))e.push('Additional ratio-model relative uncertainty must lie within 0–10.');
 if(s.fallbackAbsoluteKeV<0||s.fallbackRelativePpm<0||s.fallbackAbsoluteKeV+s.fallbackRelativePpm<=0)e.push('Declare a positive fallback matching window.');
 if(s.energyMinKeV<20||s.energyMaxKeV>3500||s.energyMaxKeV<=s.energyMinKeV)e.push('Analysis range must lie within 20–3500 keV.');
 if(s.minProbability<0||s.minProbability>1)e.push('Minimum emission probability must be between 0 and 1.');
 if(s.efficiencyCorrelation<0||s.efficiencyCorrelation>1)e.push('Efficiency correlation must lie between 0 and 1.');
 if(s.inlierFraction<=0||s.inlierFraction>=1)e.push('The centroid-model inlier fraction must lie strictly between 0 and 1.');
 if(!Number.isInteger(s.maxMixtureSize)||s.maxMixtureSize<1||s.maxMixtureSize>4)e.push('Mixture size must be an integer from 1 to 4.');
 if(s.detectionThresholdCounts!==undefined&&(!finite(s.detectionThresholdCounts)||s.detectionThresholdCounts<=0))e.push('Detection threshold must be positive.');
 const seen=new Set<number>();
 for(const p of s.efficiency){
  if(!finite(p.energyKeV)||p.energyKeV<=0||p.energyKeV>1e7||!finite(p.efficiency)||p.efficiency<1e-12||p.efficiency>1)e.push('Efficiency points require positive keV and an absolute full-energy efficiency in [1e-12,1].');
  if(seen.has(p.energyKeV))e.push('Efficiency energies must be unique.');seen.add(p.energyKeV);
  if(p.uncertainty!==undefined&&(!finite(p.uncertainty)||p.uncertainty<0||p.uncertainty>1))e.push('Efficiency uncertainty must be non-negative.');
  if(p.summingFactor!==undefined&&(!finite(p.summingFactor)||p.summingFactor<1e-6||p.summingFactor>1e6))e.push('Summing factors must be positive.');
  if(p.summingUncertainty!==undefined&&(!finite(p.summingUncertainty)||p.summingUncertainty<0||p.summingUncertainty>1e6))e.push('Summing uncertainty must be non-negative.');
 }return e;
}
export function validateReference(lines:GammaLine[]):string[]{
 const errors:string[]=[];const ids=new Set<string>();
 if(!lines.length)errors.push('Reference database is empty.');
 for(const l of lines){
  if(ids.has(l.id))errors.push(`Duplicate reference id ${l.id}`);ids.add(l.id);
  if(l.radiationType!=='gamma')errors.push(`${l.id}: unsupported radiation type`);
  if(!finite(l.energyKeV)||l.energyKeV<=0)errors.push(`${l.id}: invalid gamma energy`);
  if(l.energyUncertaintyKeV!==null&&(!finite(l.energyUncertaintyKeV)||l.energyUncertaintyKeV<0||l.energyUncertaintyKeV>1000))errors.push(`${l.id}: invalid reference uncertainty`);
  if(l.intensityKind!=='absolute-photons-per-parent-transformation')errors.push(`${l.id}: absolute emission probability required`);
  if(l.emissionProbability!==null&&(!finite(l.emissionProbability)||l.emissionProbability<0||l.emissionProbability>1))errors.push(`${l.id}: invalid absolute emission probability`);
  if(l.emissionProbabilityUncertainty!==null&&(!finite(l.emissionProbabilityUncertainty)||l.emissionProbabilityUncertainty<0))errors.push(`${l.id}: invalid emission uncertainty`);
  if(!l.nuclide||!l.source||!l.sourceUrl||!l.dataStatus)errors.push(`${l.id}: provenance is incomplete`);
 }return errors;
}
