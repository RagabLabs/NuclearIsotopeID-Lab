import data from '../data/gamma-lines.json';
import type {GammaLine,Settings} from './types';
export const database=data;
export const gammaLines:GammaLine[]=data.lines;
export function eligibleLines(lines:GammaLine[],s:Settings):GammaLine[]{return lines.filter(l=>l.radiationType==='gamma'&&l.energyKeV>=s.energyMinKeV&&l.energyKeV<=s.energyMaxKeV&&(l.emissionProbability===null||l.emissionProbability>=s.minProbability))}
export function linesFor(nuclide:string,lines:GammaLine[]=gammaLines){return lines.filter(l=>l.nuclide===nuclide)}
