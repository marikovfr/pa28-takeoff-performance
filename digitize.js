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
})();
