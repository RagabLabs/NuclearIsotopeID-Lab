/** Preferences are optional: opaque file origins or private browser policy must not break analysis. */
export const preferences={get(key:string):string|null{try{return localStorage.getItem(key)}catch{return null}},set(key:string,value:string):void{try{localStorage.setItem(key,value)}catch{/* Analysis remains usable with in-memory preferences. */}}};
