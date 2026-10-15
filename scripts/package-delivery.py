#!/usr/bin/env python3
"""Package the source and production tree without local dependencies or QA images."""
import hashlib,json,pathlib,shutil,zipfile
ROOT=pathlib.Path(__file__).resolve().parents[1]
OUT=ROOT.parent/'deliverables';OUT.mkdir(exist_ok=True)
required=['README.md','START_HERE_AR.txt','package.json','package-lock.json','LICENSE','NOTICE.md','CHANGELOG.md','dist/index.html','dist/NuclearIsotopeID-Lab.html','src/data/gamma-lines.json','data/gamma-lines.csv','data/manifest.json','docs/SCIENTIFIC_METHODS.md','docs/GAMMA_LINE_MATCHING.md','docs/IDENTIFICATION_MODELS.md','docs/REFERENCE_DATA.md','docs/DATA_SOURCES.md','docs/SCIENTIFIC_VALIDATION.md','docs/UNCERTAINTY_POLICY.md','docs/CALCULATION_UNIQUENESS.md','docs/TEST_REPORT.md','docs/KNOWN_LIMITATIONS.md','docs/FINAL_VALIDATION_REPORT.md','verification/Scientific-Validation-Report.pdf','verification/Example-Evidence-Report.pdf','.github/workflows/ci.yml','.github/workflows/pages.yml']
for name in required:
 p=ROOT/name
 if not p.is_file() or not p.stat().st_size:raise RuntimeError(f'Missing required deliverable: {name}')
summary=json.loads((ROOT/'verification/summary.json').read_text());assert summary['vitestFailed']==0 and summary['browserExecuted']==0
excluded={'node_modules','tmp','test-results','playwright-report','.git','.audit-tmp','__pycache__'}
files=[p for p in sorted(ROOT.rglob('*')) if p.is_file() and not any(s in excluded for s in p.relative_to(ROOT).parts) and not p.name.endswith('.tsbuildinfo') and p.relative_to(ROOT).as_posix()!='verification/PACKAGE_MANIFEST.json']
manifest={'manifestExcludesItsOwnFile':True,'application':'Nuclear Isotope Identification Lab','version':'1.0.0','files':[{'path':p.relative_to(ROOT).as_posix(),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in files],'verification':summary}
(ROOT/'verification/PACKAGE_MANIFEST.json').write_text(json.dumps(manifest,indent=2)+'\n')
files=[p for p in files if p.name!='PACKAGE_MANIFEST.json']+[ROOT/'verification/PACKAGE_MANIFEST.json']
source=OUT/'NuclearIsotopeID-Lab-v1.0.0.zip'
with zipfile.ZipFile(source,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
 for p in files:z.write(p,'NuclearIsotopeID-Lab/'+p.relative_to(ROOT).as_posix())
production=OUT/'NuclearIsotopeID-Lab-v1.0.0-Production.zip'
with zipfile.ZipFile(production,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
 for p in sorted((ROOT/'dist').rglob('*')):
  if p.is_file():z.write(p,'NuclearIsotopeID-Lab-Production/'+p.relative_to(ROOT/'dist').as_posix())
 z.writestr('NuclearIsotopeID-Lab-Production/START_HERE_AR.txt','''Nuclear Isotope Identification Lab v1.0.0

هذه حزمة التشغيل الإنتاجية فقط.
افتح NuclearIsotopeID-Lab.html الموجود في هذا المجلد داخل متصفح حديث.
لا تحتاج تثبيت Node.js لتشغيل الملف المستقل.
أما index.html والملفات داخل assets فهي النسخة المخصصة لخادم ويب.
للكود والتوثيق والاختبارات، استخدم حزمة المشروع الكاملة.
المثال الافتتاحي محاكاة معلنة، والتعرف البحثي ليس شهادة قطعية.
اختبارات المتصفح الفعلي لم تُشغّل في بيئة إعداد الحزمة.
لم يُنشر أي شيء على GitHub.
''')
shutil.copyfile(ROOT/'dist/NuclearIsotopeID-Lab.html',OUT/'NuclearIsotopeID-Lab-v1.0.0.html')
shutil.copyfile(ROOT/'verification/Scientific-Validation-Report.pdf',OUT/'Scientific-Validation-Report.pdf')
for p in [source,production]:
 with zipfile.ZipFile(p) as z:
  assert z.testzip() is None
  assert not any('node_modules/' in n or '/tmp/' in n for n in z.namelist())
# Validate all paths and bytes against the source package manifest.
with zipfile.ZipFile(source) as z:
 for f in manifest['files']:
  if f['path']=='verification/PACKAGE_MANIFEST.json':continue
  assert hashlib.sha256(z.read('NuclearIsotopeID-Lab/'+f['path'])).hexdigest()==f['sha256']
result={'status':'PASS','sourceFiles':len(files),'artifacts':[{'filename':p.name,'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in [source,production,OUT/'NuclearIsotopeID-Lab-v1.0.0.html',OUT/'Scientific-Validation-Report.pdf']]}
(OUT/'delivery-checks.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result,indent=2))
