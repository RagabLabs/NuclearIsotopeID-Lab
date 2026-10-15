#!/usr/bin/env python3
"""Reproducible IAEA LiveChart gamma-only importer; Python standard library only.
Default is offline reprocessing of the included byte-for-byte source snapshots.
Use --refresh to retrieve a NEW snapshot explicitly; inspect the resulting diff.
"""
import argparse, concurrent.futures, csv, datetime, hashlib, io, json, pathlib, urllib.request
ROOT=pathlib.Path(__file__).resolve().parents[1]
SPEC=[('Co-60','60co',0),('Cs-137','137cs',0),('Na-22','22na',0),('Eu-152','152eu',0),('Ba-133','133ba',0),('Am-241','241am',0),('I-131','131i',0),('Tc-99m','99tc',142.6835),('K-40','40k',0),('Bi-214','214bi',0),('Pb-214','214pb',0)]
def number(s):
 try:
  n=float(s)
  return n if __import__('math').isfinite(n) else None
 except (ValueError,TypeError):return None

def run(item,refresh):
 name,query,state=item
 url=f'https://www-nds.iaea.org/relnsd/v1/data?fields=decay_rads&nuclides={query}&rad_types=g'
 path=ROOT/'data/raw'/f'{query}-gamma.csv'
 if refresh or not path.exists():
  req=urllib.request.Request(url,headers={'User-Agent':'Livechart/1.0 NuclearIsotopeID-Lab/1.0.0'})
  raw=urllib.request.urlopen(req,timeout=45).read()
  if b'ensdf_publication' not in raw:raise ValueError(f'{name}: response is not a valid LiveChart table')
  path.write_bytes(raw)
 raw=path.read_bytes(); rows=list(csv.DictReader(io.StringIO(raw.decode('utf-8-sig'))))
 states=sorted({r.get('p_energy','') for r in rows})
 lines=[];excluded={}
 def skip(reason):excluded[reason]=excluded.get(reason,0)+1
 for i,r in enumerate(rows,2):
  p=number(r.get('p_energy')); e=number(r.get('energy'))
  # Never infer metastable state from mass+element alone.
  if p is None or abs(p-state)>0.02 or r.get('p_energy_shift','').strip():skip('different_or_unknown_parent_state');continue
  # LiveChart can append atomic X rays even to rad_types=g; nuclear levels required.
  if number(r.get('start_level_energy')) is None or number(r.get('end_level_energy')) is None:skip('no_nuclear_transition_levels');continue
  if e is None or e<20 or e>3500:skip('outside_20_3500_keV');continue
  prob=number(r.get('intensity'));u=number(r.get('unc_i'))
  if prob is not None and (prob<0 or prob>100):skip('unsupported_absolute_yield');continue
  daughter=f"{r['d_symbol']}-{int(r['d_z'])+int(r['d_n'])}"
  start=number(r.get('start_level_energy'));end=number(r.get('end_level_energy'))
  lines.append({'id':f'{query}-L{i}', 'nuclide':name,'daughter':daughter,'radiationType':'gamma','energyKeV':e,'energyUncertaintyKeV':number(r.get('unc_en')),'emissionProbability':None if prob is None else prob/100,'emissionProbabilityUncertainty':None if u is None else u/100,'intensityKind':'absolute-photons-per-parent-transformation','transitionId':f"{daughter}:{start}->{end}:{r['decay']}",'startLevelKeV':start,'endLevelKeV':end,'parentLevelKeV':p,'decayMode':r['decay'],'multipolarity':r.get('multipolarity') or None,'source':'IAEA LiveChart / ENSDF','evaluationVersion':r.get('ensdf_publication_cut-off') or None,'evaluationAuthors':r.get('ensdf_authors') or None,'extractionDate':r.get('Extraction_date') or None,'sourceUrl':url,'sourceRow':i,'rawFile':f'data/raw/{path.name}','dataStatus':'evaluated-nuclear-gamma; subset; not independently re-evaluated'})
 if not lines:raise ValueError(f'{name}: no eligible lines; available parent energies {states}')
 # Distinct source transitions are retained. Analysis coalesces unresolved groups.
 return {'nuclide':name,'query':query,'parentLevelKeV':state,'sourceUrl':url,'rawFile':f'data/raw/{path.name}','sha256':hashlib.sha256(raw).hexdigest(),'sourceRows':len(rows),'includedLines':len(lines),'excludedRows':excluded,'availableParentEnergies':states},lines

def main():
 parser=argparse.ArgumentParser();parser.add_argument('--refresh',action='store_true');args=parser.parse_args()
 with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool: results=list(pool.map(lambda x:run(x,args.refresh),SPEC))
 records=[x for _,ls in results for x in ls]
 dates=sorted({r['extractionDate'] for r in records if r['extractionDate']})
 database={'version':'IAEA-LiveChart-ENSDF-subset-'+(dates[-1] if dates else 'undated'),'appVersion':'1.0.0','retrievalDates':dates,'sourceSnapshotStatement':'API guide describes an April 2022 ENSDF snapshot. Per-line evaluation publication cutoff and actual extraction date are retained; extraction date is NOT an evaluation date. No assertion of latest ENSDF.','energyRangeKeV':[20,3500],'sourceTermsUrl':'https://nucleus.iaea.org/Pages/Others/Terms-Of-Use.aspx','dataLicense':'Source terms and attribution apply; data are excluded from the software MIT license. No IAEA or NNDC endorsement.','coverage':'Selected nuclear gamma transitions for 11 parent states; not a complete nuclide library. X rays and annihilation radiation excluded.','nuclides':[m for m,_ in results],'lines':records}
 out=ROOT/'src/data/gamma-lines.json';out.write_bytes((json.dumps(database,indent=2,ensure_ascii=False)+'\n').encode('utf-8'))
 (ROOT/'data/manifest.json').write_bytes((json.dumps({k:v for k,v in database.items() if k!='lines'},indent=2,ensure_ascii=False)+'\n').encode('utf-8'))
 with (ROOT/'data/gamma-lines.csv').open('w',newline='') as f:
  w=csv.DictWriter(f,fieldnames=list(records[0]));w.writeheader();w.writerows(records)
 print(json.dumps({'nuclides':len(results),'lines':len(records),'byNuclide':{m['nuclide']:m['includedLines'] for m,_ in results},'output':str(out)},indent=2))
if __name__=='__main__':main()
