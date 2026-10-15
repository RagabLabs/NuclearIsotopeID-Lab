import type {Match,Settings} from './types';
import {gaussianCommonOffset} from './uncertainty';
export function multilineConsistency(assignments:Match[],s:Settings){
 const residuals=assignments.map(m=>({peakId:m.peakId,referenceKeV:m.line.energyKeV,deltaKeV:m.deltaKeV,z:m.z}));
 const variances=assignments.map(m=>m.independentVarianceKeV2??NaN);
 const complete=assignments.every(m=>m.z!==null);
 const fit=complete?gaussianCommonOffset(assignments.map(m=>m.deltaKeV),variances,s.calibrationUncertaintyKeV):null;
 return {lineCount:assignments.length,residuals,chiSquare:fit?.chiSquare??null,degreesOfFreedom:fit?assignments.length:null,reducedChiSquare:fit?fit.chiSquare/assignments.length:null,commonCalibrationSigmaKeV:s.calibrationUncertaintyKeV,status:assignments.length<2?'Single independent line; multi-line consistency unavailable.':fit?'Gaussian centroid consistency with a shared calibration covariance; no calibrated identification probability.':'Multiple energy-compatible lines; incomplete uncertainties prevent a Gaussian consistency statistic.'};
}
