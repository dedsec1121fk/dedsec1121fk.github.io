export const LIMITS=Object.freeze({accounts:300,dailyActive:444,totalBytes:400000000,userBytes:900000,maxFiles:200,maxFolders:50,maxDepth:8});
export const DAY_TIME_ZONE='Europe/Athens';
export function dayKey(date=new Date()){
 const parts=Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:DAY_TIME_ZONE,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(date).map(p=>[p.type,p.value]));
 return `${parts.year}-${parts.month}-${parts.day}`;
}
