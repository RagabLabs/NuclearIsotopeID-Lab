import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
const commands=[['npm','ci'],['npm','run','validate:data'],['python3','scripts/import_iaea.py'],['npm','test'],['npm','run','typecheck'],['npm','run','build'],['node','scripts/check-standalone.mjs'],['npx','playwright','test','--list']];
const records=[];const dataFiles=['src/data/gamma-lines.json','data/gamma-lines.csv','data/manifest.json'];const hashes=()=>Object.fromEntries(dataFiles.map(p=>[p,createHash('sha256').update(fs.readFileSync(p)).digest('hex')]));let reconstruction=null;
for(const command of commands){
 console.log(`\nRunning: ${command.join(' ')}`);const start=Date.now();const before=command[0]==='python3'?hashes():null;const r=spawnSync(command[0],command.slice(1),{encoding:'utf8',maxBuffer:20*1024*1024});
 process.stdout.write(r.stdout??'');process.stderr.write(r.stderr??'');records.push({command:command.join(' '),exitCode:r.status,durationMs:Date.now()-start,stdout:r.stdout??'',stderr:r.stderr??''});
 if(before){const after=hashes();reconstruction={byteIdentical:JSON.stringify(before)===JSON.stringify(after),files:after};if(!reconstruction.byteIdentical)throw new Error('Offline reconstruction changed normalized reference bytes.')}
 if(r.status!==0){fs.mkdirSync('verification',{recursive:true});fs.writeFileSync('verification/commands.json',JSON.stringify({records,failedCommand:command.join(' ')},null,2)+'\n');process.exit(r.status??1)}
}
fs.mkdirSync('verification',{recursive:true});
fs.writeFileSync('verification/commands.json',JSON.stringify({createdAt:new Date().toISOString(),node:process.version,records,offlineReconstruction:reconstruction,browserExecution:{status:'NOT RUN',reason:'Supported browser-control capability unavailable in the preparation environment. Listing configured Playwright scenarios is not executing them.'}},null,2)+'\n');
for(const file of ['vitest.json','data-validation.json','standalone-dom.json'])fs.copyFileSync(`test-results/${file}`,`verification/${file}`);
console.log('All requested non-browser verification commands completed; actual browser execution remains NOT RUN.');
