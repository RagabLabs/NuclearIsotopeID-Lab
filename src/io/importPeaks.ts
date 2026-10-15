import type {Peak,EfficiencyPoint} from '../physics/types';
import type {EnergyUnit} from '../physics/units';
import {toKeV} from '../physics/units';
import {validatePeaks} from '../physics/validation';
/** RFC4180-style CSV/TSV reader, including escaped quotes and quoted newlines. */
export function parseDelimited(text:string,delimiter=','):string[][] {
 const rows:string[][]=[];let row:string[]=[];let field='';let quoted=false;
 const s=text.replace(/^\uFEFF/,'');
 for(let i=0;i<s.length;i++){
  const c=s[i];
  if(quoted){if(c==='"'){if(s[i+1]==='"'){field+='"';i++}else quoted=false}else field+=c}
  else if(c==='"'){if(field.trim())throw new Error('Unexpected quote in unquoted field.');quoted=true}
  else if(c===delimiter){row.push(field);field=''}
  else if(c==='\n'||c==='\r'){if(c==='\r'&&s[i+1]==='\n')i++;row.push(field);if(row.some(x=>x.trim()))rows.push(row);row=[];field=''}
  else field+=c;
 }
 if(quoted)throw new Error('Unclosed quoted field.');
 if(field||row.length){row.push(field);if(row.some(x=>x.trim()))rows.push(row)}return rows;
}
const normalize=(h:string)=>h.trim().replace(/[()]/g,'').replace(/[\s-]+/g,'_').toLowerCase();
const aliases:Record<string,string>={energy:'energy',peak_energy:'energy',peak_energy_kev:'energy',energykev:'energy',energy_kev:'energy',energy_ev:'energy',energy_mev:'energy',energymev:'energy',energyev:'energy',energy_uncertainty:'uncertainty',energyuncertaintykev:'uncertainty',energy_uncertainty_kev:'uncertainty',uncertainty_kev:'uncertainty',unc_en:'uncertainty',energy_uncertainty_mev:'uncertainty',energyuncertaintymev:'uncertainty',energy_uncertainty_ev:'uncertainty',energyuncertaintyev:'uncertainty',uncertainty_ev:'uncertainty',uncertainty_mev:'uncertainty',uncertainty:'uncertainty',net_peak_area:'area',net_area:'area',area:'area',counts:'area',peak_area_uncertainty:'areaUncertainty',area_uncertainty:'areaUncertainty',areauncertainty:'areaUncertainty',fwhm:'fwhm',fwhmkev:'fwhm',fwhm_kev:'fwhm',fwhm_ev:'fwhm',fwhm_mev:'fwhm',fwhmev:'fwhm',fwhmmev:'fwhm',measurement_time:'time',measurement_time_s:'time',measurementtimesec:'time',detector_identifier:'detector',detector_id:'detector',detectorid:'detector',id:'id',weight:'weight',significance:'weight'};
export function parsePeaks(text:string,format:'csv'|'tsv'|'json',unit:EnergyUnit='keV'):Peak[]{
 if(text.length>2_000_000)throw new Error('Input exceeds the 2 MB peak-list limit.');
 let records:Record<string,unknown>[];
 let effectiveUnit=unit;
 if(format==='json'){
  const value=JSON.parse(text);
  if(value&&typeof value==='object'&&!Array.isArray(value)&&value.energyUnit!==undefined){if(!['eV','keV','MeV'].includes(value.energyUnit))throw new Error('Unsupported JSON energyUnit.');effectiveUnit=value.energyUnit}
  records=Array.isArray(value)?value:value?.peaks;
  if(!Array.isArray(records))throw new Error('JSON must be an array of peaks or an object with a peaks array.');
 }else {
  const rows=parseDelimited(text,format==='tsv'?'\t':',');
  if(rows.length<2)throw new Error('A header and at least one data row are required.');
  const headers=rows[0].map(normalize);
  if(new Set(headers).size!==headers.length)throw new Error('Duplicate column headers are not allowed.');
  const explicit=headers.includes('energy_mev')?'MeV':headers.includes('energy_ev')?'eV':headers.includes('energy_kev')||headers.includes('energykev')||headers.includes('peak_energy_kev')?'keV':unit;
  effectiveUnit=explicit;
  records=rows.slice(1).map((r,i)=>{if(r.length!==headers.length)throw new Error(`Row ${i+2}: expected ${headers.length} fields, received ${r.length}.`);return Object.fromEntries(headers.map((h,j)=>[h,r[j]]))});
 }
 const peaks=records.map((r,i)=>{
  if(!r||typeof r!=='object'||Array.isArray(r))throw new Error(`Row ${i+1}: expected an object.`);
  const mapped:Record<string,unknown>={};
  for(const [k,v] of Object.entries(r)){const key=aliases[normalize(k)];if(key){if(mapped[key]!==undefined)throw new Error(`Row ${i+1}: more than one column maps to ${key}.`);mapped[key]=v}}
  const numeric=(key:string,required=false):number|undefined=>{
   const raw=mapped[key];if(raw===undefined||raw===null||String(raw).trim()===''){if(required)throw new Error(`Row ${i+1}: peak energy is required. Raw channels are unsupported.`);return undefined}
   const n=Number(raw);if(!Number.isFinite(n))throw new Error(`Row ${i+1}: ${key} must be a finite number.`);return n;
  };
  const en=numeric('energy',true)!;
  const unc=numeric('uncertainty'),fwhm=numeric('fwhm');
  // Explicit *KeV keys always remain in keV, even when a global selector differs.
  const keys=Object.keys(r).map(normalize);
  const jsonKeV=keys.includes('energykev')||keys.includes('energy_kev')||keys.includes('peak_energy_kev');
  const rowUnit=jsonKeV?'keV':keys.some(k=>['energy_mev','energymev'].includes(k))?'MeV':keys.some(k=>['energy_ev','energyev'].includes(k))?'eV':effectiveUnit;
  const uncertaintyUnit=keys.some(k=>['energyuncertaintykev','energy_uncertainty_kev','uncertainty_kev'].includes(k))?'keV':keys.some(k=>['energy_uncertainty_ev','energyuncertaintyev','uncertainty_ev'].includes(k))?'eV':keys.some(k=>['energy_uncertainty_mev','energyuncertaintymev','uncertainty_mev'].includes(k))?'MeV':rowUnit;
  const fwhmUnit=keys.some(k=>['fwhm_kev','fwhmkev'].includes(k))?'keV':keys.some(k=>['fwhm_ev','fwhmev'].includes(k))?'eV':keys.some(k=>['fwhm_mev','fwhmmev'].includes(k))?'MeV':rowUnit;
  return {id:String(mapped.id||`P${i+1}`),energyKeV:toKeV(en,rowUnit),energyUncertaintyKeV:unc===undefined?undefined:toKeV(unc,uncertaintyUnit),area:numeric('area'),areaUncertainty:numeric('areaUncertainty'),fwhmKeV:fwhm===undefined?undefined:toKeV(fwhm,fwhmUnit),measurementTimeSec:numeric('time'),detectorId:mapped.detector===undefined?undefined:String(mapped.detector),weight:numeric('weight')};
 });
 const errors=validatePeaks(peaks);if(errors.length)throw new Error(errors.join('\n'));return peaks;
}
export function parseEfficiency(text:string):EfficiencyPoint[]{
 if(!text.trim())return [];
 const rows=parseDelimited(text,',');const header=rows[0].map(normalize);
 if(new Set(header).size!==header.length)throw new Error('Duplicate efficiency column headers are not allowed.');
 const required=['energy_kev','efficiency'];if(required.some(k=>!header.includes(k)))throw new Error('Efficiency CSV requires energy_keV,efficiency columns.');
 if(rows.length<2)throw new Error('Efficiency CSV has no points.');
 return rows.slice(1).map((row,i)=>{
  if(row.length!==header.length)throw new Error(`Efficiency row ${i+2}: wrong number of fields.`);
  const r=Object.fromEntries(header.map((k,j)=>[k,row[j]]));
  const get=(k:string,required=false)=>{if(r[k]===undefined||r[k].trim()===''){if(required)throw new Error(`Efficiency ${k} is required.`);return undefined}const n=Number(r[k]);if(!Number.isFinite(n))throw new Error(`Efficiency ${k} must be finite.`);return n};
  return {energyKeV:get('energy_kev',true)!,efficiency:get('efficiency',true)!,uncertainty:get('uncertainty'),summingFactor:get('summing_factor'),summingUncertainty:get('summing_uncertainty')};
 });
}
