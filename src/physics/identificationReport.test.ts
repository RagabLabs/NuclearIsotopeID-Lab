import {describe,it,expect} from 'vitest';
import {analyzeIdentification} from './identificationReport';
import {gammaLines} from './gammaDatabase';
import {line,peak,config} from './fixtures';
import {defaultSettings,validatePeaks,validateReference,validateSettings} from './validation';
import {parsePeaks,parseEfficiency} from '../io/importPeaks';
import {demoPeaks,demoEfficiency} from '../data/examples';
import {csvText,reportRows,reportTextLines} from '../io/exportReport';
const ref=[line('a1','Sim-A',100),line('a2','Sim-A',200)];
describe('10 • Evidence synthesis with non-probabilistic status',()=>{
 it('single exclusive line is tentative, never confirmed',()=>{expect(analyzeIdentification([peak('p',100)],ref,config()).conclusions[0].status).toBe('Tentative')});
 it('two independent exclusive lines can be supported',()=>{const r=analyzeIdentification([peak('p',100),peak('q',200)],ref,config());expect(r.status).toBe('Supported');expect(r.conclusions[0].supportingLines).toBe(2)});
 it('single shared line remains ambiguous',()=>{const r=analyzeIdentification([peak('p',100)],[...ref,line('b1','Sim-B',100)],config());expect(r.status).toBe('Ambiguous');expect(r.conclusions.every(c=>c.status==='Ambiguous')).toBe(true)});
 it('no valid match produces insufficient evidence and no generated isotope name',()=>{const r=analyzeIdentification([peak('p',888)],ref,config());expect(r.status).toBe('Insufficient Evidence');expect(r.candidates).toEqual([])});
 it('supports known Co-60 lines using the downloaded evaluated database',()=>{const r=analyzeIdentification([peak('a',1173.228),peak('b',1332.492)],gammaLines,{...defaultSettings,calibrationUncertaintyKnown:true,minProbability:.01});expect(r.conclusions.find(c=>c.nuclide==='Co-60')?.status).toBe('Supported')});
 it('keeps missing-line claims qualitative in the absence of sensitivity information',()=>{const r=analyzeIdentification([peak('p',100)],ref,config());expect(r.details[0].missing.find(m=>m.line.energyKeV===200)?.state).toBe('not-assessable')});
 it('never claims experimental validation or calibrated verbal classes',()=>{const r=analyzeIdentification([peak('p',100)],ref,config());expect(r.validation).toEqual({independentExperimentalValidation:false,classificationsCalibrated:false})});
 it('a conflicting efficiency-corrected ratio downgrades a candidate',()=>{const s=config({efficiency:[{energyKeV:100,efficiency:.1,uncertainty:.001},{energyKeV:200,efficiency:.1,uncertainty:.001}],summingAssumption:'negligible'});const r=analyzeIdentification([peak('p',100,{area:1000,areaUncertainty:32}),peak('q',200,{area:100,areaUncertainty:10})],ref,s);expect(r.conclusions[0].status).toBe('Tentative');expect(r.conclusions[0].contradictions).toBe(1)});
 it('the simulated mixed example retains an unexplained peak and yields finite serializable results',()=>{const r=analyzeIdentification(parsePeaks(demoPeaks,'csv'),gammaLines,{...defaultSettings,efficiency:parseEfficiency(demoEfficiency),summingAssumption:'negligible'});expect(r.mixture.mixtures[0].nuclides.sort()).toEqual(['Co-60','Cs-137','K-40']);expect(r.mixture.mixtures[0].unexplained).toEqual(['P5']);let bad=false;JSON.stringify(r,(_k,v)=>{if(typeof v==='number'&&!Number.isFinite(v))bad=true;return v});expect(bad).toBe(false)});
});
describe('Edge cases • validation',()=>{
 it('rejects net areas that would underflow ratio arithmetic',()=>{expect(validatePeaks([peak('p',100,{area:1e-300})]).length).toBeGreaterThan(0)});
 it('rejects efficiency scales that would underflow response arithmetic',()=>{expect(validateSettings(config({efficiency:[{energyKeV:100,efficiency:1e-300}]})).length).toBeGreaterThan(0)});
 it('does not treat unassessed calibration as zero known uncertainty',()=>{const r=analyzeIdentification([peak('p',100),peak('q',200)],ref,config({calibrationUncertaintyKnown:false}));expect(r.status).toBe('Tentative');expect(r.matching.matches.every(m=>m.z===null)).toBe(true);expect(r.hypotheses.every(h=>h.logLikelihood===null)).toBe(true)});
 it('rejects an empty peak list',()=>{expect(()=>analyzeIdentification([],ref,config())).toThrow('at least one')});
 it.each([-1,0,NaN,Infinity])('rejects nonpositive/nonfinite measured energy %s',energyKeV=>{expect(validatePeaks([peak('p',energyKeV)]).length).toBeGreaterThan(0)});
 it('rejects duplicate peak records',()=>{expect(validatePeaks([peak('p',100),peak('q',100)]).join()).toContain('duplicate')});
 it('rejects unsupported radiation types',()=>{expect(validateReference([{...ref[0],radiationType:'x-ray'}]).join()).toContain('unsupported')});
 it('rejects relative gamma intensities masquerading as absolute emissions',()=>{expect(validateReference([{...ref[0],intensityKind:'relative-intensity'}]).join()).toContain('absolute')});
 it('permits absent emission probabilities for energy-only analysis',()=>{const r=analyzeIdentification([peak('p',100)],[line('a','Sim-A',100,null)],config());expect(r.candidates).toHaveLength(1);expect(r.details[0].intensity.ratios).toEqual([])});
 it('rejects invalid efficiency values and duplicate response energies',()=>{expect(validateSettings(config({efficiency:[{energyKeV:100,efficiency:1.1},{energyKeV:100,efficiency:.1}]}))).toHaveLength(2)});
 it('does not silently accept an invalid analysis range',()=>{expect(()=>analyzeIdentification([peak('p',100)],ref,config({energyMinKeV:200,energyMaxKeV:100}))).toThrow('range')});
});
describe('Reproducible exports',()=>{
 it('uses the same frozen input, candidates, matches, alternatives and warnings in CSV and PDF text',()=>{const r=analyzeIdentification([peak('p',100),peak('q',200)],ref,config());const rows=reportRows(r),pdf=reportTextLines(r).join('\n');expect(rows.filter(x=>x[0]==='match')).toHaveLength(r.matching.matches.length);expect(rows.filter(x=>x[0]==='conclusion')).toHaveLength(r.conclusions.length);expect(pdf).toContain(r.createdAt);expect(pdf).toContain(r.dataVersion);expect(pdf).toContain('ALTERNATIVE HYPOTHESES');expect(pdf).toContain('No activity fractions')});
 it('quotes comma/newline data and protects formula-leading CSV cells',()=>{const text=csvText([['=1+1','x,y','line\nnext','"quote"']]);expect(text).toContain('"\'=1+1"');expect(text).toContain('"x,y"');expect(text).toContain('""quote""')});
});
