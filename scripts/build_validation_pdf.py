#!/usr/bin/env python3
"""Render the recorded validation artifacts; requires ReportLab, not needed by the app."""
import base64,io,json,pathlib,html
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet,ParagraphStyle
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate,Paragraph,Spacer,Table,TableStyle,PageBreak,KeepTogether
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
ROOT=pathlib.Path(__file__).resolve().parents[1]
read=lambda n:json.loads((ROOT/'verification'/n).read_text())
summary=read('summary.json');audit=read('calculation-validation.json');commands=read('commands.json')
font=base64.b64decode(json.loads((ROOT/'src/data/pdf-font.json').read_text()))
pdfmetrics.registerFont(TTFont('LabSans',io.BytesIO(font)))
navy=colors.HexColor('#102a38');teal=colors.HexColor('#147963');gray=colors.HexColor('#596d79');line=colors.HexColor('#dce5e8');soft=colors.HexColor('#f3f7f8')
styles=getSampleStyleSheet()
styles.add(ParagraphStyle(name='LabTitle',fontName='LabSans',fontSize=23,leading=31,textColor=navy,spaceAfter=14))
styles.add(ParagraphStyle(name='LabH1',fontName='LabSans',fontSize=15,leading=21,textColor=navy,spaceAfter=14))
styles.add(ParagraphStyle(name='LabH2',fontName='LabSans',fontSize=11,leading=16,textColor=teal,spaceAfter=9))
styles.add(ParagraphStyle(name='LabBody',fontName='LabSans',fontSize=9,leading=14,textColor=navy,spaceAfter=9))
styles.add(ParagraphStyle(name='LabSmall',fontName='LabSans',fontSize=8,leading=12,textColor=gray,spaceAfter=5))
styles.add(ParagraphStyle(name='LabTiny',fontName='LabSans',fontSize=7.3,leading=10.5,textColor=navy))
styles.add(ParagraphStyle(name='LabCell',fontName='LabSans',fontSize=8,leading=12,textColor=navy))
styles.add(ParagraphStyle(name='LabWhite',fontName='LabSans',fontSize=8,leading=12,textColor=colors.white))
P=lambda s,style='LabBody':Paragraph(html.escape(str(s)).replace('\n','<br/>'),styles[style])
def grid(headers,rows,widths):
 data=[[P(h,'LabWhite') for h in headers]]+[[P(x,'LabCell') for x in r] for r in rows]
 t=Table(data,colWidths=widths,repeatRows=1,hAlign='LEFT')
 t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),navy),('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),9),('RIGHTPADDING',(0,0),(-1,-1),9),('TOPPADDING',(0,0),(-1,-1),8),('BOTTOMPADDING',(0,0),(-1,-1),8),('LINEBELOW',(0,0),(-1,0),.5,navy),('LINEBELOW',(0,1),(-1,-1),.5,line),('ROWBACKGROUNDS',(0,1),(-1,-1),[colors.white,soft])]))
 return t
story=[]
story += [Spacer(1,26),P('PROJECT 09  /  RESEARCH SOFTWARE','LabH2'),P('Nuclear Isotope\nIdentification Lab','LabTitle'),P('Scientific verification report | v1.0.0','LabH1'),P('Recorded verification: '+summary['generatedAt'],'LabSmall'),Spacer(1,10)]
story.append(P('Implementation and DOM checks passed. Real-browser verification remains pending.','LabH2'))
story.append(P('This report records what was actually executed. It does not certify isotope-identification accuracy, a false-positive rate, or a calibrated confidence probability. The example measurements and analytical fixtures are explicitly simulated.'))
story.append(grid(['Recorded metric','Result'],[
 ['Production reference library',f"{summary['nuclides']} parent states / {summary['gammaLines']} nuclear gamma transitions"],
 ['Executed Vitest checks',f"{summary['vitestPassed']} passed / {summary['vitestFailed']} failed in {summary['testFiles']} files"],
 ['Test breakdown',f"{summary['scientificTests']} scientific/data-identity + {summary['parserTests']} parser + {summary['reactDomTests']} React DOM"],
 ['Independent function audit',f"{summary['calculationAuditPassed']} analytical cases passed"],
 ['Actual browser tests',f"0 executed / {summary['browserNotExecuted']} configured cases NOT RUN"],
 ['Independent experimental campaign','Not performed'],['GitHub / Pages publication','Not performed']], [165,340]))
story += [Spacer(1,16),P('Use boundary','LabH2'),P('Research-oriented gamma-ray isotope identification support. Candidate identifications are not definitive without suitable measurement quality, calibrated detector response, validated methods and expert review. A single gamma line is never treated as conclusive proof.')]
story.append(PageBreak())
story += [P('Executed technical checks','LabH1'),P('Exit codes below are taken from the retained command records. Listing Playwright tests is not executing them.','LabSmall')]
story.append(grid(['Command actually executed','Exit'],[(r['command'],r['exitCode']) for r in commands['records']],[455,50]))
story += [Spacer(1,15),P('Reference integrity and reproducibility','LabH2'),P('All 667 normalized records were checked against retained raw IAEA source rows and SHA-256 hashes. The offline importer reproduced the normalized JSON, CSV and manifest byte for byte. Source extraction and nuclear evaluation dates remain separate.'),P('The production standalone HTML was executed in jsdom with an opaque file origin, including initial scientific results, SVG DOM, Arabic RTL, English and analysis interaction. This verifies bundle execution and handlers; it does not verify real visual layout, Canvas rasterization or browser downloads.'),P('Browser checks not executed','LabH2'),P('Nine scenarios are configured for each of desktop Chromium and mobile Chromium: simulation/chart, CSV upload, manual input, tool navigation, language/theme, PDF download, CSV download, PNG download, and reference/responsive checks. The supported browser-control capability was unavailable in the preparation environment. These 18 cases are delivered for later actual execution.')]
story.append(PageBreak())
story += [P('Ten-function result summary','LabH1'),P('Reference expectations are independently stated analytical results. Full input, method, source and limit details follow.','LabSmall')]
short=[('01','Energy line matching','delta 0.6; sigma sqrt(0.5); z 0.848528','PASS'),('02','Candidate ranking','2 independent + 2 exclusive; 28 points','PASS'),('03','Multi-line consistency','Correlated centroid chi-square = 2/3','PASS'),('04','Missing expected lines','1000 predicted counts; conditional missing flag','PASS'),('05','Shared-line ambiguity','One shared group; two parent explanations','PASS'),('06','Relative intensity','Observed ratio 1; detector-weighted ratio 1; z=0','PASS'),('07','Mixture attribution','Two-component explanation; coverage 2/3','PASS'),('08','Evidence coverage','Peak 0.5; weighted 0.75; listed-area 0.1','PASS'),('09','Alternative hypotheses','Matches analytical Gaussian-plus-uniform log density','PASS'),('10','Compound evidence report','Single-line candidate remains Tentative','PASS')]
story.append(grid(['ID','Function','Reference and observed result','State'],short,[31,135,290,49]))
story += [Spacer(1,16),P('The detailed Markdown matrix in docs/FINAL_VALIDATION_REPORT.md contains all requested columns: function, scientific question, inputs, method, source, expected result, actual result, tests, pass/fail and use limits. The following pages carry the same review information as per-function tables.','LabSmall')]
for r in audit['cases']:
 story.append(PageBreak());story += [P(f"{r['id']}  {r['name']}",'LabH1')]
 rows=[('Scientific question',r['question']),('Inputs',r['inputs']),('Method',r['method']),('Source / grounding',r['source']),('Independent reference result',r['expected']),('Actual application result',r['actual']),('Executed tests',r['tests']),('Audit status','PASS' if r['passed'] else 'FAIL'),('Use limits',r['limits'])]
 story.append(grid(['Review field','Verified content'],rows,[120,385]))
 story += [Spacer(1,15),P('Analytical fixtures use explicitly simulated labels, not real nuclide identities. They are test-only records and are not present in the production nuclear gamma reference library.','LabSmall')]
story.append(PageBreak());story += [P('Sources and remaining scientific limits','LabH1')]
for text in [
 'The production numerical source is IAEA LiveChart decay radiations derived from ENSDF. Its API guide describes an April 2022 ENSDF snapshot; source retrieval was 2026-10-14. Row-level evaluator names, cutoff dates, source URLs, parent excitation and original line numbers are retained.',
 'Independent LNHB Co-60 photon-table spot checks agree with the selected photon energies and absolute yields. A newer LNHB Cs-137 evaluation differs slightly from the bundled older IAEA row; the difference is disclosed and not silently merged. This is a versioned reference subset, not a claim of latest ENSDF.',
 'Calibration covariance is a shared offset only. Reference-energy/yield covariances are not supplied. Efficiency correlation is configurable; other independence assumptions and extra response-model uncertainty are stated. Missing-line contradictions require full sensitivity and response information.',
 'The mixture cover is bounded and heuristic. Conditional centroid likelihoods depend on an explicit line-density and clutter model. Evidence points, verbal classes, coverage fractions and relative likelihoods are not calibrated isotope-presence probabilities.',
 'Real-browser downloads, Canvas PNG, responsive/mobile/RTL visual layout and actual GitHub CI/Pages operation remain unexecuted. An independent labelled experimental benchmark is still needed before any performance or confidence claim.'
 ]:story.append(P(text))
story += [Spacer(1,12),P('Primary sources','LabH2')]
for u in ['https://www-nds.iaea.org/relnsd/vcharthtml/api_v0_guide.html','https://www-nds.iaea.org/relnsd/vcharthtml/guide.html','https://www.nndc.bnl.gov/ensdf/','https://www.lnhb.fr/nuclides/Co-60_tables.pdf','https://www.lnhb.fr/nuclides/Cs-137_tables.pdf','https://www.bipm.org/documents/20126/2071204/JCGM_100_2008_E.pdf','https://nucleus.iaea.org/Pages/Others/Terms-Of-Use.aspx']:
 story.append(P(u,'LabSmall'))
def chrome(canvas,doc):
 canvas.saveState();w,h=A4;canvas.setFillColor(navy);canvas.rect(0,h-33,w,33,fill=1,stroke=0);canvas.setFont('LabSans',8);canvas.setFillColor(colors.white);canvas.drawString(45,h-21,'NUCLEAR ISOTOPE IDENTIFICATION LAB  /  VERIFICATION');canvas.setStrokeColor(line);canvas.line(45,36,w-45,36);canvas.setFillColor(gray);canvas.setFont('LabSans',7);canvas.drawString(45,23,'v1.0.0  |  Research evidence; not a definitive isotope certificate');canvas.drawRightString(w-45,23,str(doc.page));canvas.restoreState()
out=ROOT/'verification/Scientific-Validation-Report.pdf'
doc=SimpleDocTemplate(str(out),pagesize=A4,rightMargin=45,leftMargin=45,topMargin=53,bottomMargin=49,title='Nuclear Isotope Identification Lab - Scientific verification',author='NuclearIsotopeID-Lab')
doc.build(story,onFirstPage=chrome,onLaterPages=chrome)
print(out)
