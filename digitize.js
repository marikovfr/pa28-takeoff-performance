/* Unverified manual graph transcription workspace. Never used for flight computations. */
(function(){'use strict';
const KEY='pa28-manual-readings-v04'; // Stable storage key across versions; preserve existing readings.
const form=document.getElementById('point-form');
if(!form)return;
const chartSelect=document.getElementById('chart-select');
const srcImage=document.getElementById('source-image');
const openImage=document.getElementById('open-image');
const marker=document.getElementById('point-marker');
const positionStatus=document.getElementById('position-status');
let selectedPosition=null;
const imageFor=fig=>`fig-${fig}-originale.png`;
function resetPosition(){selectedPosition=null;marker.hidden=true;positionStatus.textContent='Nessuna posizione selezionata.';}
chartSelect.addEventListener('change',()=>{
  const fig=chartSelect.value;
  srcImage.src=imageFor(fig);srcImage.alt=`Pagina POH originale, figura ${fig}`;
  openImage.href=imageFor(fig); document.getElementById('pt-figure').value=fig;
  resetPosition();
});
document.getElementById('pt-figure').addEventListener('change',()=>{chartSelect.value=document.getElementById('pt-figure').value;chartSelect.dispatchEvent(new Event('change'));});
srcImage.addEventListener('click',event=>{
  const rect=srcImage.getBoundingClientRect();
  const x=Math.max(0,Math.min(1,(event.clientX-rect.left)/rect.width));
  const y=Math.max(0,Math.min(1,(event.clientY-rect.top)/rect.height));
  selectedPosition={x:Number(x.toFixed(5)),y:Number(y.toFixed(5)),image:imageFor(chartSelect.value)};
  marker.style.left=`${x*100}%`;marker.style.top=`${y*100}%`;marker.hidden=false;
  positionStatus.textContent=`Punto segnato sulla scansione: x=${(x*100).toFixed(1)}%, y=${(y*100).toFixed(1)}%. Lettura numerica ancora manuale e da verificare.`;
});
document.getElementById('clear-position').addEventListener('click',resetPosition);
const count=document.getElementById('point-count'), list=document.getElementById('point-list'), msg=document.getElementById('point-message');
let points=[];
try{const saved=JSON.parse(localStorage.getItem(KEY)||'[]');if(Array.isArray(saved))points=saved.filter(x=>x&&x.reviewStatus==='unverified').slice(0,500);}catch(e){msg.textContent='Impossibile leggere i punti salvati.'}
const text=(id)=>document.getElementById(id).value.trim();
const num=(id)=>Number(text(id));
function save(){try{localStorage.setItem(KEY,JSON.stringify(points));return true;}catch(e){msg.textContent='Memoria non disponibile. Esporta i dati prima di chiudere.';return false;}}
function render(){count.textContent=points.length+' punti salvati sul dispositivo (tutti NON verificati).';list.replaceChildren();points.forEach((p,i)=>{const row=document.createElement('div');row.className='point-row';const t=document.createElement('span');t.textContent=`#${i+1} Fig. ${p.figure} · ${p.pressureAltitudeFt} ft · ${p.temperatureC} °C · ${p.weightKg} kg · ${p.headwindKt} kt → ${p.groundRollM} m · DA VERIFICARE${p.scanLocation?` · scansione (${(p.scanLocation.x*100).toFixed(1)}%, ${(p.scanLocation.y*100).toFixed(1)}%)`:""}`;const b=document.createElement('button');b.type='button';b.textContent='Elimina';b.onclick=()=>{points.splice(i,1);save();render()};row.append(t,b);list.append(row)});}
form.addEventListener('submit',event=>{event.preventDefault();const figure=text('pt-figure');const vals={pressureAltitudeFt:num('pt-alt'),temperatureC:num('pt-temp'),weightKg:num('pt-weight'),headwindKt:num('pt-wind'),groundRollM:num('pt-roll')};const ranges={pressureAltitudeFt:[0,7000],temperatureC:[-40,40],weightKg:[900,1157],headwindKt:[-10,15],groundRollM:[1,2000]};if(Object.entries(vals).some(([k,v])=>!Number.isFinite(v)||v<ranges[k][0]||v>ranges[k][1])){msg.textContent='Valore mancante o fuori dagli intervalli consentiti.';return;}
if(points.some(p=>p.figure===figure&&Object.entries(vals).filter(([k])=>k!=='groundRollM').every(([k,v])=>p[k]===v))){msg.textContent='Esiste già una lettura con le stesse condizioni: controlla prima il duplicato.';return;}
if(points.length>=500){msg.textContent='Limite di 500 punti raggiunto: esporta prima di proseguire.';return;}
points.push({figure,...vals,scanLocation:selectedPosition&&figure===chartSelect.value?{...selectedPosition}:null,notes:text('pt-note'),reviewStatus:'unverified',source:'Manual transcription from original PA-28-181 POH VB-1120 figure — user-supplied reading',recordedAt:new Date().toISOString()});save();render();msg.textContent='Punto salvato come DA VERIFICARE; nessuna modifica al calcolo.';form.reset();chartSelect.value='5-11';chartSelect.dispatchEvent(new Event('change'));});
document.getElementById('point-export').addEventListener('click',()=>{const payload={schema:'pa28-unverified-point-readings-v1',warning:'NOT VALIDATED FOR OPERATIONAL USE. User transcriptions, not approved flight performance data.',points};const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='pa28-punti-da-verificare.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),3000);msg.textContent='Esportazione avviata.';});
document.getElementById('point-clear').addEventListener('click',()=>{if(!confirm('Eliminare TUTTI i punti locali? Prima esporta se vuoi conservarli.'))return;points=[];save();render();msg.textContent='Punti locali eliminati.';});render();

// Backup import, audit and CSV export. Deliberately never wired to engine.js.
const admissibleFigures=new Set(['5-11','5-13']);
const bounds={pressureAltitudeFt:[0,7000],temperatureC:[-40,40],weightKg:[900,1157],headwindKt:[-10,15],groundRollM:[1,2000]};
function validReading(p){
 return p && admissibleFigures.has(p.figure) && p.reviewStatus==='unverified' &&
 Object.entries(bounds).every(([k,[lo,hi]])=>typeof p[k]==='number'&&Number.isFinite(p[k])&&p[k]>=lo&&p[k]<=hi) &&
 (!p.scanLocation || (Number.isFinite(p.scanLocation.x)&&Number.isFinite(p.scanLocation.y)&&p.scanLocation.x>=0&&p.scanLocation.x<=1&&p.scanLocation.y>=0&&p.scanLocation.y<=1));
}
function readingKey(p){return [p.figure,p.pressureAltitudeFt,p.temperatureC,p.weightKg,p.headwindKt].join('|');}
function download(filename,content,type){const blob=new Blob([content],{type});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),4000);}
const audit=document.getElementById('audit-result');
document.getElementById('point-audit').addEventListener('click',()=>{
 const keys=new Map();let duplicates=0,inconsistent=0,unlocated=0;
 points.forEach(p=>{if(!validReading(p))inconsistent++;if(!p.scanLocation)unlocated++;const k=readingKey(p);if(keys.has(k))duplicates++;keys.set(k,true);});
 audit.textContent=`Registro: ${points.length} letture NON verificate.\nRecord invalidi: ${inconsistent}; condizioni duplicate: ${duplicates}; senza posizione su scansione: ${unlocated}.\nQuesto NON verifica l’accuratezza delle distanze rispetto al POH.`;
});
document.getElementById('point-csv').addEventListener('click',()=>{
 const cols=['figure','pressureAltitudeFt','temperatureC','weightKg','headwindKt','groundRollM','scanX','scanY','notes','reviewStatus','recordedAt'];
 const quote=v=>'"'+String(v??'').replaceAll('"','""')+'"';
 const rows=[cols.map(quote).join(','),...points.map(p=>[p.figure,p.pressureAltitudeFt,p.temperatureC,p.weightKg,p.headwindKt,p.groundRollM,p.scanLocation?.x,p.scanLocation?.y,p.notes,p.reviewStatus,p.recordedAt].map(quote).join(','))];
 download('pa28-letture-non-validate.csv','\ufeff'+rows.join('\r\n'),'text/csv;charset=utf-8');
});
document.getElementById('point-import').addEventListener('change',async e=>{
 const file=e.target.files?.[0];if(!file)return;
 if(file.size>1000000){msg.textContent='File troppo grande (massimo 1 MB).';e.target.value='';return;}
 try{
  const data=JSON.parse(await file.text());
  if(data.schema!=='pa28-unverified-point-readings-v1'||!Array.isArray(data.points)||data.points.length>500||data.points.some(p=>!validReading(p)))throw new Error('Formato o valori non compatibili.');
  const existing=new Set(points.map(p=>readingKey(p)));let added=0,skipped=0;
  for(const p of data.points){const k=readingKey(p);if(existing.has(k)||points.length>=500){skipped++;continue;}
   const cleaned={figure:p.figure,pressureAltitudeFt:p.pressureAltitudeFt,temperatureC:p.temperatureC,weightKg:p.weightKg,headwindKt:p.headwindKt,groundRollM:p.groundRollM,scanLocation:p.scanLocation?{x:p.scanLocation.x,y:p.scanLocation.y,image:imageFor(p.figure)}:null,notes:String(p.notes||'').slice(0,240),reviewStatus:'unverified',source:'Imported unverified reading',recordedAt:String(p.recordedAt||'')};
   points.push(cleaned);existing.add(k);added++;
  }
  save();render();msg.textContent=`Importate ${added} letture NON verificate; ${skipped} duplicate/oltre limite ignorate. Nessuna influenza sui calcoli.`;
 }catch(err){msg.textContent='Importazione non eseguita: '+err.message;}
 e.target.value='';
});

})();
