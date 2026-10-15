import {useMemo,useRef,useState} from 'react';
import {Download,RotateCcw} from 'lucide-react';
import type {AnalysisReport} from '../physics/identificationReport';
import type {Copy} from '../i18n';
import {formatNumber as f} from '../physics/units';
import {exportChartPng} from '../io/exportReport';
export function SpectrumChart({report,t,disabled=false,onError}:{report:AnalysisReport;t:Copy;disabled?:boolean;onError:(error:string)=>void}){
 const svg=useRef<SVGSVGElement>(null);const [maximum,setMaximum]=useState(2200);const [reference,setReference]=useState(true);const [hover,setHover]=useState<string|null>(null);
 const useArea=report.peaks.every(p=>p.area!==undefined);
 const peaks=report.peaks.filter(p=>p.energyKeV<=maximum),maxArea=useArea?Math.max(1,...report.peaks.map(p=>p.area!)):1;
 const explained=new Set(report.mixture.mixtures[0]?.peakIds??[]);
 const refs=useMemo(()=>report.candidates.slice(0,4).flatMap(c=>c.assignments.map(m=>m.line)).filter((x,i,a)=>a.findIndex(y=>y.id===x.id)===i),[report]);
 const x=(e:number)=>62+e/maximum*970,y=(area:number)=>275-Math.max(0,area)/maxArea*204;
 return <section className="panel chart-panel"><div className="panel-head"><div><h2>{t.spectrum}</h2><p>{t.spectrumSub}</p></div><button className="icon-button" title={t.downloadPng} aria-label={t.downloadPng} disabled={disabled} onClick={()=>svg.current&&exportChartPng(svg.current).catch(e=>onError(String(e)))}><Download size={17}/></button></div>
  <div className="plot-legend"><span><i className="dot mint"/>{t.measured}</span><span><i className="dot amber"/>{t.unexplained}</span><label><input type="checkbox" checked={reference} onChange={e=>setReference(e.target.checked)}/><i className="line-key"/>{t.refLines}</label></div>
  <svg ref={svg} data-export-chart="spectrum" className="spectrum-svg" viewBox="0 0 1100 365" role="img" aria-label={t.spectrum} onMouseLeave={()=>setHover(null)}>
   <rect width="1100" height="365" rx="12" fill="#101f2c"/>
   {[0,.25,.5,.75,1].map(a=><g key={a}><line x1="62" y1={y(maxArea*a)} x2="1032" y2={y(maxArea*a)} stroke="#2b3b47" strokeDasharray="3 5"/><text x="48" y={y(maxArea*a)+4} textAnchor="end" fill="#9dabb8" fontSize="11" fontFamily="monospace">{f(maxArea*a,0)}</text></g>)}
   {Array.from({length:6},(_,i)=>i*maximum/5).map(e=><g key={e}><line x1={x(e)} y1="50" x2={x(e)} y2="275" stroke="#223440"/><text x={x(e)} y="302" textAnchor="middle" fill="#9dabb8" fontSize="11" fontFamily="monospace">{f(e,0)}</text></g>)}
   <text x="18" y="24" fill="#adbfca" fontSize="11" fontFamily="sans-serif">{report.peaks.every(p=>p.area!==undefined)?'LISTED NET PEAK AREA':'UNIT STEM HEIGHT (AREA UNAVAILABLE)'}</text>
   {reference&&refs.filter(l=>l.energyKeV<=maximum).map(l=><g key={l.id}><line x1={x(l.energyKeV)} y1="46" x2={x(l.energyKeV)} y2="275" stroke="#7aa3c2" strokeDasharray="4 5" opacity=".7"/><text x={x(l.energyKeV)+5} y="45" fill="#a7c6db" fontSize="10" fontFamily="monospace" transform={`rotate(-24 ${x(l.energyKeV)+5} 45)`}>{l.nuclide}</text></g>)}
   {peaks.map(p=><g key={p.id} tabIndex={0} role="img" aria-label={`${p.id} ${p.energyKeV} keV`} onFocus={()=>setHover(p.id)} onMouseEnter={()=>setHover(p.id)}><line x1={x(p.energyKeV)} x2={x(p.energyKeV)} y1={y(useArea?p.area!:1)} y2="275" stroke={explained.has(p.id)?'#7ee4c3':'#f1bb63'} strokeWidth={hover===p.id?'4':'2.5'}/><circle cx={x(p.energyKeV)} cy={y(useArea?p.area!:1)} r="3.6" fill={explained.has(p.id)?'#7ee4c3':'#f1bb63'}/><rect x={x(p.energyKeV)-12} y="50" width="24" height="230" fill="transparent"/><text x={x(p.energyKeV)+5} y={Math.max(63,y(useArea?p.area!:1)-10)} fill="#edf4f7" fontSize="11" fontFamily="monospace">{f(p.energyKeV,2)}</text></g>)}
   <line x1="62" x2="1032" y1="275" y2="275" stroke="#52626e"/><text x="547" y="338" textAnchor="middle" fill="#b5c6d1" fontSize="12" fontFamily="sans-serif">ENERGY (keV)</text>
   {hover&&<g><rect x="720" y="313" width="316" height="35" fill="#253e4c" rx="6"/><text x="735" y="335" fontFamily="monospace" fill="#d7f9ed" fontSize="12">{hover}: {f(report.peaks.find(p=>p.id===hover)?.energyKeV,5)} keV</text></g>}
  </svg>
  <div className="plot-controls"><label>{t.plotRange}<input aria-label={t.plotRange} type="range" min="200" max="3500" step="50" value={maximum} onChange={e=>setMaximum(Number(e.target.value))}/><span className="mono">{maximum}</span></label><button className="text-button" onClick={()=>setMaximum(3500)}><RotateCcw size={13}/>{t.reset}</button></div>
 </section>
}
export function BarChart({rows,label,unit=''}:{rows:{name:string;value:number;color?:string}[];label:string;unit?:string}){
 const max=Math.max(1,...rows.map(x=>x.value));const height=Math.max(95,rows.length*48+15);
 return <svg data-export-chart="bar" className="bar-chart" viewBox={`0 0 680 ${height}`} role="img" aria-label={label}>{rows.length?rows.map((r,i)=><g key={r.name}><text x="0" y={i*48+23} fill="currentColor" fontSize="13" fontFamily="monospace">{r.name}</text><rect x="160" y={i*48+8} width={Math.max(2,r.value/max*410)} height="24" rx="4" fill={r.color??'#42a88f'}/><text x={174+Math.max(2,r.value/max*410)} y={i*48+25} fill="currentColor" fontSize="12" fontFamily="monospace">{f(r.value,3)}{unit}</text></g>):<text x="12" y="35" fill="currentColor" fontSize="14">No assessable records</text>}</svg>
}
export function ResidualChart({report,nuclide,label}:{report:AnalysisReport;nuclide:string;label:string}){
 const rows=report.candidates.find(c=>c.nuclide===nuclide)?.assignments??[];
 const maximum=Math.max(3,...rows.filter(r=>r.z!==null).map(r=>Math.abs(r.z!)));const yy=(z:number)=>125-z/maximum*85;
 return <svg data-export-chart="residual" className="residual-chart" viewBox="0 0 760 260" role="img" aria-label={label}><rect x="65" y={yy(2)} width="640" height={yy(-2)-yy(2)} fill="#43a58b" opacity=".1"/><line x1="65" x2="705" y1="125" y2="125" stroke="currentColor" opacity=".4"/>{[-3,-2,0,2,3].map(z=><g key={z}><line x1="65" x2="705" y1={yy(z)} y2={yy(z)} stroke="currentColor" opacity=".15" strokeDasharray="3 5"/><text x="38" y={yy(z)+4} fill="currentColor" fontSize="12">{z}</text></g>)}{rows.filter(r=>r.z!==null).map((r,i)=>{const x=100+i/(Math.max(1,rows.length-1))*550;return <g key={r.line.id}><circle cx={x} cy={yy(r.z!)} r="5" fill="#40a38c"/><text x={x} y="236" fill="currentColor" fontSize="11" textAnchor="middle">{f(r.line.energyKeV,1)}</text></g>})}<text x="380" y="258" textAnchor="middle" fill="currentColor" fontSize="11">Reference energy (keV) • z unavailable when uncertainties are incomplete</text></svg>
}
