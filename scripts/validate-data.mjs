import fs from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const db=JSON.parse(fs.readFileSync(path.join(root,'src/data/gamma-lines.json'),'utf8'));
function csv(text){const rows=[];let r=[],f='',q=false;for(let i=0;i<text.length;i++){const c=text[i];if(q){if(c==='"'){if(text[i+1]==='"'){f+='"';i++}else q=false}else f+=c}else if(c==='"')q=true;else if(c===','){r.push(f);f=''}else if(c==='\n'||c==='\r'){if(c==='\r'&&text[i+1]==='\n')i++;r.push(f);if(r.some(x=>x.trim()))rows.push(r);r=[];f=''}else f+=c}if(r.length||f){r.push(f);rows.push(r)}return rows}
const errors=[];const checks=[];const seen=new Set();
for(const n of db.nuclides){try{
 const raw=fs.readFileSync(path.join(root,n.rawFile));assert.equal(createHash('sha256').update(raw).digest('hex'),n.sha256);
 const rows=csv(raw.toString());const headers=rows[0];const records=rows.slice(1).map(r=>Object.fromEntries(headers.map((h,i)=>[h,r[i]])));
 const lines=db.lines.filter(l=>l.nuclide===n.nuclide);assert.equal(lines.length,n.includedLines);
 for(const l of lines){
  assert(!seen.has(l.id));seen.add(l.id);const r=records[l.sourceRow-2];assert(r);
  assert.equal(l.energyKeV,Number(r.energy));assert.equal(l.emissionProbability,r.intensity.trim()===''?null:Number(r.intensity)/100);
  assert.equal(l.energyUncertaintyKeV,r.unc_en.trim()===''?null:Number(r.unc_en));
  assert.equal(l.emissionProbabilityUncertainty,r.unc_i.trim()===''?null:Number(r.unc_i)/100);
  assert.equal(l.evaluationVersion,r['ensdf_publication_cut-off']);assert.equal(l.extractionDate,r.Extraction_date);
  assert(Math.abs(l.parentLevelKeV-n.parentLevelKeV)<.02);assert(r.start_level_energy.trim()&&r.end_level_energy.trim());
  assert(l.energyKeV>=20&&l.energyKeV<=3500);assert(l.emissionProbability===null||(l.emissionProbability>=0&&l.emissionProbability<=1));
  assert.equal(l.radiationType,'gamma');assert.equal(l.intensityKind,'absolute-photons-per-parent-transformation');
 }
 checks.push({nuclide:n.nuclide,lines:lines.length,sourceHash:'PASS',sourceRowsAndNormalization:'PASS'});
}catch(e){errors.push(`${n.nuclide}: ${e.message}`)}}
assert.equal(db.nuclides.length,11);assert.equal(seen.size,db.lines.length);
assert(!db.lines.some(l=>l.nuclide==='Na-22'&&Math.abs(l.energyKeV-511)<.01));
const summary={time:new Date().toISOString(),databaseVersion:db.version,nuclides:db.nuclides.length,gammaLines:db.lines.length,checks,errors,status:errors.length?'FAIL':'PASS'};
fs.mkdirSync(path.join(root,'test-results'),{recursive:true});fs.writeFileSync(path.join(root,'test-results/data-validation.json'),JSON.stringify(summary,null,2)+'\n');
console.log(JSON.stringify(summary,null,2));if(errors.length)process.exitCode=1;
