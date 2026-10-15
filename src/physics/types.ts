export interface GammaLine {
 id:string;nuclide:string;daughter:string;radiationType:string;energyKeV:number;energyUncertaintyKeV:number|null;
 emissionProbability:number|null;emissionProbabilityUncertainty:number|null;intensityKind:string;
 transitionId:string;startLevelKeV:number|null;endLevelKeV:number|null;parentLevelKeV:number;decayMode:string;
 source:string;evaluationVersion:string|null;evaluationAuthors?:string|null;extractionDate?:string|null;
 sourceUrl:string;sourceRow?:number;rawFile?:string;dataStatus:string;
}
export interface Peak {
 id:string;energyKeV:number;energyUncertaintyKeV?:number;area?:number;areaUncertainty?:number;
 fwhmKeV?:number;measurementTimeSec?:number;detectorId?:string;weight?:number;
}
export interface EfficiencyPoint {energyKeV:number;efficiency:number;uncertainty?:number;summingFactor?:number;summingUncertainty?:number}
export interface Settings {
 kSigma:number;calibrationUncertaintyKnown:boolean;calibrationUncertaintyKeV:number;calibrationOffsetKeV:number;
 fallbackAbsoluteKeV:number;fallbackRelativePpm:number;minProbability:number;
 energyMinKeV:number;energyMaxKeV:number;efficiency:EfficiencyPoint[];
 efficiencyCorrelation:number;intensityModelRelativeUncertainty?:number;summingAssumption:'unassessed'|'negligible'|'corrected';
 detectionThresholdCounts?:number;peakListComplete:boolean;maxMixtureSize:number;
 inlierFraction:number;
}
export interface Match {peakId:string;line:GammaLine;deltaKeV:number;sigmaKeV:number|null;independentVarianceKeV2:number|null;z:number|null;toleranceKeV:number;basis:'uncertainty'|'declared-window';incompleteUncertainty:boolean}
export interface PeakGroup {id:string;peakIds:string[]}
export interface MatchResult {matches:Match[];groups:PeakGroup[];warnings:string[]}
export interface Candidate {nuclide:string;assignments:Match[];independentLines:number;uniqueLines:number;score:number;energyQuality:number;missingCount:number;explanation:string}
export type LineVisibility='observed'|'expected-not-seen'|'below-sensitivity'|'not-assessable';
export interface MissingLine {line:GammaLine;state:LineVisibility;expectedCounts:number|null;uncertainty:number|null;lowerCounts:number|null;reason:string}
export interface RatioResult {line:GammaLine;anchor:GammaLine;observed:number;expected:number;observedUncertainty:number|null;expectedUncertainty:number|null;logResidual:number;z:number|null;assessment:string}
export interface Mixture {nuclides:string[];peakIds:string[];score:number;coverage:number;unexplained:string[];assignments:{peakId:string;nuclides:string[]}[]}
export interface Hypothesis {nuclides:string[];logLikelihood:number|null;deltaDeviance:number|null;relativeLikelihood:number|null;status:string;lineCount:number}
export type IdentificationStatus='Strongly Supported'|'Supported'|'Tentative'|'Ambiguous'|'Insufficient Evidence';
