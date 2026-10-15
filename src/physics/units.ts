export type EnergyUnit='eV'|'keV'|'MeV';
export function toKeV(value:number,unit:EnergyUnit):number {return value*(unit==='eV'?0.001:unit==='MeV'?1000:1)}
export function formatNumber(value:number|null|undefined,digits=3):string {
 if(value===undefined||value===null||!Number.isFinite(value))return '—';
 if(value===0)return '0';
 if(Math.abs(value)<0.001||Math.abs(value)>=1000000)return value.toExponential(3);
 return new Intl.NumberFormat('en',{maximumFractionDigits:digits}).format(value);
}
