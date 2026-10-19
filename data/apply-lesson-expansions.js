/* Existing-lesson enrichment: keep original IDs, titles, groups and card counts.
   Enhancements and Markdown export have identical source keys. */
(function() {
  "use strict";
  const patches=window.ARCHIVE_LESSON_EXTENSIONS||[];
  const sources={en:window.ARCHIVE_EN,el:window.ARCHIVE_EL};
  const byKey=new Set(),stats={expected:patches.length,applied:0,missing:[],duplicates:[]};
  for(const p of patches){
    const key=p.l+"\n"+p.p;
    if(byKey.has(key)){stats.duplicates.push(key);continue;}
    byKey.add(key);
    const records=sources[p.l]||[],target=records.find(r=>r.p===p.p);
    if(!target){stats.missing.push(key);continue;}
    const addition=String(p.append||"").trim();
    if(addition.length<450){stats.missing.push(key+": empty/too short");continue;}
    if(p.mode==="replace")target.b=addition;
    else if(!target.b.includes(addition))target.b=target.b.trimEnd()+"\n\n"+addition;
    stats.applied++;
  }
  window.__DEDSEC_LESSON_ENRICHMENT__=Object.freeze(stats);
  if(stats.missing.length||stats.duplicates.length)console.error("Incomplete bilingual lesson expansions",stats);
})();
