import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const listed=spawnSync('npm',['ls','--omit=dev','--all','--parseable'],{encoding:'utf8'});if(listed.status!==0)throw new Error(listed.stderr);
const parts=['NUCLEAR ISOTOPE IDENTIFICATION LAB - THIRD-PARTY NOTICES',fs.readFileSync('NOTICE.md','utf8'),'BUNDLED PDF FONT',fs.readFileSync('docs/DEJAVU_FONT_LICENSE.txt','utf8')];
for(const dir of [...new Set(listed.stdout.trim().split('\n'))].filter(d=>path.resolve(d)!==process.cwd())){
 const manifest=path.join(dir,'package.json');if(!fs.existsSync(manifest))continue;const p=JSON.parse(fs.readFileSync(manifest,'utf8'));
 const licenses=fs.readdirSync(dir).filter(name=>/^(licen[sc]e|copying|notice)(\.|$)/i.test(name)&&fs.statSync(path.join(dir,name)).isFile());
 parts.push(`\nPACKAGE ${p.name} ${p.version} | ${p.license??'see package notice'}\n`);
 for(const name of licenses)parts.push(`${name}\n${fs.readFileSync(path.join(dir,name),'utf8')}`);
}
fs.writeFileSync('public/THIRD-PARTY-NOTICES.txt',parts.join('\n\n'));fs.copyFileSync('LICENSE','public/LICENSE.txt');console.log('Collected release dependency and font notices.');
