import type {AnalysisReport} from '../physics/identificationReport';
import {formatNumber as f} from '../physics/units';
export function downloadBlob(blob:Blob,filename:string){const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),5000)}
export function reportRows(r:AnalysisReport):string[][]{
 const rows=[['section','nuclide','peak_id','measured_keV','reference_keV','delta_keV','normalized_residual','value','details','source']];
 const row=(section:string,n='',p='',measured:unknown='',ref:unknown='',delta:unknown='',z:unknown='',value:unknown='',details='',source='')=>rows.push([section,n,p,measured,ref,delta,z,value,details,source].map(x=>x===null||x===undefined?'':String(x)));
 row('metadata','','','','','','',r.appVersion,JSON.stringify({dataVersion:r.dataVersion,createdAt:r.createdAt,status:r.status,label:r.label,inputProvenance:r.inputProvenance}));
 row('settings','','','','','','','',JSON.stringify(r.settings));
 row('reference_manifest','','','','','','',r.reference.lines,JSON.stringify(r.reference));
 for(const p of r.peaks)row('input','',p.id,p.energyKeV,'','','',p.area,JSON.stringify(p));
 for(const c of r.candidates)row('candidate',c.nuclide,'','','','','',c.score,c.explanation);
 for(const m of r.matching.matches)row('match',m.line.nuclide,m.peakId,r.peaks.find(p=>p.id===m.peakId)?.energyKeV,m.line.energyKeV,m.deltaKeV,m.z,'',JSON.stringify(m),m.line.sourceUrl);
 for(const p of r.peaks.filter(p=>!r.matching.matches.some(m=>m.peakId===p.id)))row('unexplained','',p.id,p.energyKeV);
 for(const d of r.details){
  row('multiline',d.nuclide,'','','','','',d.consistency.chiSquare,JSON.stringify(d.consistency));
  for(const m of d.missing)row('visibility',d.nuclide,'','',m.line.energyKeV,'','',m.expectedCounts,JSON.stringify(m),m.line.sourceUrl);
  for(const x of d.intensity.ratios)row('intensity',d.nuclide,'','',x.line.energyKeV,'',x.z,x.observed,JSON.stringify(x),x.line.sourceUrl);
 }
 for(const group of r.ambiguity.shared)row('ambiguity',group.nuclides.join(' + '),group.peakIds.join('|'),'','','','','',JSON.stringify(group));
 for(const m of r.mixture.mixtures)row('mixture',m.nuclides.join(' + '),'','','','','',m.score,JSON.stringify(m));
 row('coverage','','','','','','',r.coverage.weightedCoverage,JSON.stringify(r.coverage));
 for(const h of r.hypotheses)row('hypothesis',h.nuclides.join(' + '),'','','','','',h.logLikelihood,JSON.stringify(h));
 for(const c of r.conclusions)row('conclusion',c.nuclide,'','','','','',c.status,c.reason);
 for(const warning of r.warnings)row('warning','','','','','','','',warning);
 return rows;
}
export function csvText(rows:string[][]):string{return '\uFEFF'+rows.map(row=>row.map(value=>{const safe=/^[=+@\t\r]/.test(value)?`'${value}`:value;return '"'+safe.replace(/"/g,'""')+'"'}).join(',')).join('\r\n')}
export function exportCsv(r:AnalysisReport){downloadBlob(new Blob([csvText(reportRows(r))],{type:'text/csv;charset=utf-8'}),'isotope-evidence.csv')}
export function exportJson(r:AnalysisReport){downloadBlob(new Blob([JSON.stringify(r,null,2)],{type:'application/json'}),'isotope-evidence.json')}
export function reportTextLines(r:AnalysisReport):string[]{
 const s=r.settings;
 const out=['NUCLEAR ISOTOPE IDENTIFICATION LAB',`Evidence report | v${r.appVersion} | ${r.createdAt}`,`Input provenance: ${r.inputProvenance}`,`Data: ${r.dataVersion}`,`Overall status: ${r.status} (uncalibrated classification)`,r.label,'MEASUREMENT & ANALYSIS SETTINGS',
 `Energy range: ${s.energyMinKeV}–${s.energyMaxKeV} keV. Minimum absolute emission probability: ${f(s.minProbability*100,6)}%. Matching multiplier k: ${s.kSigma}.`,
 `Calibration assessment supplied: ${s.calibrationUncertaintyKnown}. Common calibration standard uncertainty: ${f(s.calibrationUncertaintyKeV,6)} keV. Known offset subtracted: ${f(s.calibrationOffsetKeV,6)} keV.`,
 `Fallback window components: ${f(s.fallbackAbsoluteKeV,6)} keV and ${f(s.fallbackRelativePpm)} ppm. This window is not a statistical uncertainty.`,
 `Efficiency error correlation: ${f(s.efficiencyCorrelation)}. Summing treatment: ${s.summingAssumption}. Extra response-ratio relative uncertainty: ${f(s.intensityModelRelativeUncertainty,6)}.`,
 `Peak list declared complete: ${s.peakListComplete}. External detection threshold: ${f(s.detectionThresholdCounts)} net counts. Mixture maximum: ${s.maxMixtureSize} components. Centroid-model inlier fraction: ${s.inlierFraction}.`,
 'DETECTOR FULL-ENERGY EFFICIENCY INPUTS'];
 if(!s.efficiency.length)out.push('No efficiency response supplied.');
 for(const e of s.efficiency)out.push(`${f(e.energyKeV,6)} keV: absolute efficiency=${f(e.efficiency,8)}; u=${f(e.uncertainty,8)}; summing factor=${f(e.summingFactor,6)}; u(summing)=${f(e.summingUncertainty,6)}.`);
 out.push('OBSERVED PEAKS');
 for(const p of r.peaks)out.push(`${p.id}: E=${f(p.energyKeV,6)} keV, u(E)=${f(p.energyUncertaintyKeV,6)}, net area=${f(p.area)}, u(area)=${f(p.areaUncertainty)}, FWHM=${f(p.fwhmKeV)} keV, live time=${f(p.measurementTimeSec)} s, detector=${p.detectorId??'unspecified'}, external evidence weight=${f(p.weight??1)}.`);
 out.push('CANDIDATE RANKING (EVIDENCE POINTS; NOT PROBABILITY)');
 for(const c of r.candidates)out.push(`${c.nuclide}: score=${f(c.score)}, ${c.independentLines} independent supports, ${c.uniqueLines} exclusive. ${c.explanation}`);
 out.push('ALL ENERGY-COMPATIBLE REFERENCE LINES');
 for(const m of r.matching.matches){
  out.push(`${m.peakId} -> ${m.line.nuclide} ${f(m.line.energyKeV,6)} keV; delta=${f(m.deltaKeV,6)} keV; z=${f(m.z)}; window=${f(m.toleranceKeV,6)} keV; basis=${m.basis}.`);
  out.push(`Reference ${m.line.id}: absolute P=${f(m.line.emissionProbability,8)}; u(P)=${f(m.line.emissionProbabilityUncertainty,8)}; daughter=${m.line.daughter}; nuclear levels ${f(m.line.startLevelKeV,6)} -> ${f(m.line.endLevelKeV,6)} keV; mode=${m.line.decayMode}; parent level=${f(m.line.parentLevelKeV,6)} keV.`);
  out.push(`Evaluation cutoff: ${m.line.evaluationVersion??'unknown'}; evaluators: ${m.line.evaluationAuthors??'not supplied'}; extraction: ${m.line.extractionDate??'unknown'}; raw source: ${m.line.rawFile??'not supplied'}, row ${m.line.sourceRow??'unknown'}. ${m.line.sourceUrl}`);
 }
 out.push('UNEXPLAINED PEAKS');const un=r.peaks.filter(p=>!r.matching.matches.some(m=>m.peakId===p.id));out.push(un.length?un.map(p=>`${p.id} (${f(p.energyKeV,6)} keV)`).join('; '):'None within the selected reference model.');
 for(const d of r.details){
  const c=d.consistency;out.push(`MULTI-LINE CONSISTENCY: ${d.nuclide}`,`Independent lines=${c.lineCount}; centroid chi-square=${f(c.chiSquare,8)}; degrees of freedom=${f(c.degreesOfFreedom)}; reduced chi-square=${f(c.reducedChiSquare,8)}; common calibration u=${f(c.commonCalibrationSigmaKeV,6)} keV.`,c.status);
  for(const x of c.residuals)out.push(`${x.peakId}: reference ${f(x.referenceKeV,6)} keV; delta ${f(x.deltaKeV,6)} keV; z=${f(x.z,6)}.`);
  out.push(`LINE VISIBILITY: ${d.nuclide}`);
  for(const m of d.missing)out.push(`${f(m.line.energyKeV,6)} keV (${m.line.id}): ${m.state}; expected mean=${f(m.expectedCounts)} +/- ${f(m.uncertainty)}, lower mean estimate=${f(m.lowerCounts)} counts. ${m.reason}`);
  out.push(`EFFICIENCY-CORRECTED RATIOS: ${d.nuclide}`);
  if(!d.intensity.ratios.length)out.push('Not assessable with supplied data.');
  for(const x of d.intensity.ratios)out.push(`${f(x.line.energyKeV)} / ${f(x.anchor.energyKeV)} keV: observed=${f(x.observed,6)} +/- ${f(x.observedUncertainty,6)}; expected=${f(x.expected,6)} +/- ${f(x.expectedUncertainty,6)}; log residual=${f(x.logResidual,6)}; z=${f(x.z,6)}. ${x.assessment}`);
  out.push(...d.intensity.warnings);
 }
 out.push('SHARED-LINE AMBIGUITIES');if(!r.ambiguity.shared.length)out.push('No shared-parent evidence groups under the selected library and filter.');for(const a of r.ambiguity.shared)out.push(`${a.peakIds.join(', ')}: ${a.nuclides.join(' / ')}`);
 out.push('DISCRIMINATING LINES',r.ambiguity.note);for(const a of r.ambiguity.discriminating)out.push(`${a.nuclide}: ${a.lines.map(l=>`${f(l.energyKeV)} keV`).join(', ')||'No unobserved separated line in this subset.'}`);
 out.push('MIXTURE EXPLANATIONS',r.modelAssumptions.mixture,`Searched subsets=${r.mixture.searched}; candidate space truncated=${r.mixture.truncated}.`);
 r.mixture.mixtures.forEach((m,i)=>{out.push(`Alternative ${i+1}: ${m.nuclides.join(' + ')}; objective=${f(m.score,6)}; independent-group coverage=${f(m.coverage*100,3)}%; explained peaks=${m.peakIds.join(', ')||'none'}; unexplained=${m.unexplained.join(', ')||'none'}.`);for(const a of m.assignments)out.push(`  ${a.peakId}: ${a.nuclides.join(' / ')||'unexplained'}`)});
 const cov=r.coverage;out.push('EVIDENCE COVERAGE',`Listed peaks explained: ${cov.explainedPeaks}/${cov.totalPeaks} (${f(cov.peakFraction*100,3)}%). Unexplained listed-peak fraction: ${f(cov.unexplainedPeakFraction*100,3)}%.`,`Independent groups explained: ${cov.explainedGroups}/${cov.totalIndependentGroups} (${f(cov.groupFraction*100,3)}%). Externally weighted evidence coverage: ${f(cov.weightedCoverage*100,3)}%.`,`Fraction of listed net peak area: ${cov.listedNetAreaFraction===null?'unavailable':f(cov.listedNetAreaFraction*100,5)+'%'}.`,cov.note,'ALTERNATIVE HYPOTHESES',r.modelAssumptions.hypothesis);
 for(const h of r.hypotheses)out.push(`${h.nuclides.join(' + ')||'Clutter only'}: reference centers=${h.lineCount}; log L=${f(h.logLikelihood,8)}; Delta deviance=${f(h.deltaDeviance,8)}; relative likelihood=${f(h.relativeLikelihood,8)}. ${h.status}`);
 out.push('NUCLIDE-SPECIFIC CONCLUSIONS');for(const c of r.conclusions)out.push(`${c.nuclide}: ${c.status}. ${c.reason}`);
 out.push('LIMITATIONS & WARNINGS',...r.warnings,'MODEL VALIDATION',`Independent experimental campaign: ${r.validation.independentExperimentalValidation}. Calibrated evidence classes: ${r.validation.classificationsCalibrated}.`,'REFERENCE DATA MANIFEST',`Data version: ${r.reference.version}; stored lines=${r.reference.lines}; parent states=${r.reference.nuclides.join(', ')}.`,r.reference.sourceSnapshotStatement);
 for(const m of r.reference.manifest){out.push(`${m.nuclide}: included lines=${m.includedLines}; source records=${m.sourceRows}; parent selection level=${f(m.parentLevelKeV,6)} keV; raw file=${m.rawFile}.`,`Source SHA-256: ${m.sha256}`,m.sourceUrl)}
 return out;
}
export async function createPdfDocument(r:AnalysisReport){
 const {jsPDF}=await import('jspdf');const font=(await import('../data/pdf-font.json')).default;const pdf=new jsPDF({unit:'mm',format:'a4'});pdf.addFileToVFS('DejaVuSans.ttf',font);pdf.addFont('DejaVuSans.ttf','LabSans','normal');pdf.setProperties({title:'Nuclear Isotope Identification Lab evidence report',subject:'Research evidence; not a definitive isotope certificate'});let y=19;let page=1;
 const header=()=>{pdf.setFont('LabSans','normal');pdf.setFontSize(8);pdf.setTextColor(100);pdf.text('NuclearIsotopeID Lab | research evidence | v1.0.0',16,10);pdf.text(String(page),190,287,{align:'right'});pdf.setTextColor(25);};header();
 pdf.setFontSize(9);
 for(const line of reportTextLines(r)){
  const safe=line.replace(/—/g,'unavailable').replace(/×/g,'x').replace(/±/g,'+/-');
  const heading=line.length<95&&/^[A-Z0-9 &:/()=.,-]+$/.test(line);
  if(heading&&y>257){pdf.addPage();page++;y=19;header()}
  pdf.setFontSize(heading?10.5:9);pdf.setTextColor(heading?'#185b54':'#192e3a');
  const wrapped=pdf.splitTextToSize(safe,177) as string[];
  for(const part of wrapped){if(y>276){pdf.addPage();page++;y=19;header();pdf.setFontSize(9)}pdf.text(part,16,y);y+=4.7}y+=2;
 }
 return pdf;
}
export async function exportPdf(r:AnalysisReport){const pdf=await createPdfDocument(r);pdf.save('isotope-evidence.pdf')}
export async function exportChartPng(svg:SVGSVGElement){
 const clone=svg.cloneNode(true) as SVGSVGElement;clone.setAttribute('xmlns','http://www.w3.org/2000/svg');clone.setAttribute('width','1440');const vb=svg.viewBox.baseVal;const height=Math.max(300,Math.round(1440*(vb.height||365)/(vb.width||1100)));clone.setAttribute('height',String(height));
 clone.style.color=getComputedStyle(svg).color;const bg=document.createElementNS('http://www.w3.org/2000/svg','rect');bg.setAttribute('width','100%');bg.setAttribute('height','100%');bg.setAttribute('fill',getComputedStyle(document.documentElement).getPropertyValue('--panel').trim()||'#ffffff');clone.insertBefore(bg,clone.firstChild);
 const xml=new XMLSerializer().serializeToString(clone);const blob=new Blob([xml],{type:'image/svg+xml;charset=utf-8'}),url=URL.createObjectURL(blob);
 try{
  const img=new Image();await new Promise<void>((resolve,reject)=>{img.onload=()=>resolve();img.onerror=()=>reject(new Error('Could not rasterize the chart.'));img.src=url});
  const canvas=document.createElement('canvas');canvas.width=1440;canvas.height=height;const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Canvas is unavailable.');ctx.drawImage(img,0,0,1440,height);
  const output=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('PNG encoding failed.')),'image/png'));downloadBlob(output,'gamma-line-evidence.png');
 }finally{URL.revokeObjectURL(url)}
}
