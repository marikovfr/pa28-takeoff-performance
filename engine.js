"use strict";
const APP_VERSION='0.13';
const ALT={7000:['A1','A5'],6000:['A2','A7'],5000:['A3','A9'],4000:['A4','A11'],3000:['A6','A12'],2000:['A8','A14'],1000:['A10','A15'],0:['A13','A16']};
const P=['P1','P2','P3','P4','P5','P6','P7','P8'];
const H=[['H3','H4','H7'],['H5','H6','H9'],['H8','H10','H12'],['H11','H13'],['H14','H15'],['H16','H17'],['H18','H19'],['H20']];
const X={tempRef21:806, tempScalePxPerC:6, weightEntry:1021, windEntry:1482, wind10:1598.3333333, distanceAxis:1663};
const Y={graphBottom:1087, ft400:1088, ft600:1023};
const TRACK_SPACE={w:2048,h:1326};
let tracks=null;
class MissingGeometry extends Error{}
function lineY(id,x){const r=tracks[id];if(!r)throw new MissingGeometry('Traccia assente: '+id);const [a,b,c,d]=[r.x1_px,r.y1_px,r.x2_px,r.y2_px];if(a===c)throw new MissingGeometry('Traccia verticale');return b+(x-a)*(d-b)/(c-a)}
function bounds(id,x,tolerance=0){const r=tracks[id];return x>=Math.min(r.x1_px,r.x2_px)-tolerance&&x<=Math.max(r.x1_px,r.x2_px)+tolerance}
function chainY(ids,x){const parts=ids.map(id=>{let r=tracks[id];return {id,lo:Math.min(r.x1_px,r.x2_px),hi:Math.max(r.x1_px,r.x2_px)}}).sort((a,b)=>a.lo-b.lo);
 for(let p of parts)if(x>=p.lo&&x<=p.hi)return lineY(p.id,x);
 for(let i=0;i<parts.length-1;i++){const a=parts[i],b=parts[i+1];if(a.hi<=x&&x<=b.lo&&b.lo-a.hi<=8){const ya=lineY(a.id,a.hi),yb=lineY(b.id,b.lo);if(Math.hypot(b.lo-a.hi,yb-ya)<=8)return ya+(x-a.hi)*(yb-ya)/(b.lo-a.hi)}}
 throw new MissingGeometry('Segmento del vento non disponibile a x='+x.toFixed(1)+' per '+ids.join('+'))}
function altitudeAt(q,t){if(!(q>=0&&q<=7000&&t>=-40&&t<=35))throw new MissingGeometry('Quota/temperatura fuori dal campo previsto');
 const x=X.tempRef21+(t-21)*X.tempScalePxPerC;let data=[];for(const [alt,ids] of Object.entries(ALT)){const located=ids.filter(id=>bounds(id,x,0));if(located.length===1)data.push({alt:+alt,y:lineY(located[0],x),track:located[0]}); else if(located.length>1){const ys=located.map(id=>lineY(id,x));if(Math.max(...ys)-Math.min(...ys)>3)throw new MissingGeometry('Segmenti quota incoerenti');data.push({alt:+alt,y:ys.reduce((a,b)=>a+b)/ys.length,track:located.join('+')})}}
 data.sort((a,b)=>a.alt-b.alt);const exact=data.find(v=>v.alt===q);if(exact)return {...exact,x};
 for(let i=0;i<data.length-1;i++){const a=data[i],b=data[i+1];if(b.alt-a.alt===1000&&a.alt<q&&q<b.alt){const t=(q-a.alt)/1000;return {alt:q,y:a.y+(b.y-a.y)*t,track:a.track+'/'+b.track,x}}}
 throw new MissingGeometry('Curve della quota insufficienti per interpolare questa combinazione')}
function pair(y,ids,xin,xout,fn,label){const vals=ids.map((id,i)=>({id:String(i+1),track:id,y:fn(id,xin),i})).sort((a,b)=>a.y-b.y);let matches=[];for(let i=0;i<vals.length-1;i++){let a=vals[i],b=vals[i+1];if(a.y<=y&&y<=b.y)matches.push([a,b])}if(matches.length!==1)throw new MissingGeometry(label+': ingresso fuori dalla famiglia di curve');const [a,b]=matches[0];if(Math.abs(a.i-b.i)!==1)throw new MissingGeometry(label+': curve non adiacenti');const t=(y-a.y)/(b.y-a.y);return {tracks:[a.track,b.track],fraction:t,y:(1-t)*fn(a.track,xout)+t*fn(b.track,xout)} }
function weightAt(y,lb){if(lb<1980||lb>2550)throw new MissingGeometry('Peso fuori dalla scala rappresentata');let x=1112.1818181818182+(2400-lb)*.565;const read=(id,z)=>lineY(id,z);const w=pair(y,P,X.weightEntry,x,read,'Peso');for(const id of w.tracks)if(!bounds(id,X.weightEntry,2)||!bounds(id,x,2))throw new MissingGeometry('Peso: tratto mancante '+id);return {...w,x}}
function headwindAt(y,wind){if(wind<0||wind>15)throw new MissingGeometry('Vento in coda non ancora calibrato: calcolo bloccato');const x=X.windEntry+(wind/10)*(X.wind10-X.windEntry);return {...pair(y,H,X.windEntry,x,chainY,'Vento frontale'),x}}
function buildTrace(a,w,h){return {points:{A:{x:a.x,y:Y.graphBottom,label:'A'},B:{x:a.x,y:a.y,label:'B'},C:{x:X.weightEntry,y:a.y,label:'C'},D:{x:w.x,y:w.y,label:'D'},E:{x:X.windEntry,y:w.y,label:'E'},F:{x:h.x,y:h.y,label:'F'},G:{x:X.distanceAxis,y:h.y,label:'G'}},resultY:h.y}}
function compute({alt,temp,mass,wind}){for(let v of [alt,temp,mass,wind])if(!Number.isFinite(v))throw new MissingGeometry('Dati numerici mancanti');if(mass<900||mass>1157)throw new MissingGeometry('Massa fuori dal campo previsto');const lb=mass*2.20462262185;const a=altitudeAt(alt,temp),w=weightAt(a.y,lb),h=headwindAt(w.y,wind);const ft=400+200*(Y.ft400-h.y)/(Y.ft400-Y.ft600);if(!Number.isFinite(ft)||ft<=0||ft>3500)throw new MissingGeometry('Intersezione distanza fuori dalla scala plausibile');return {ft,m:ft*.3048,altitude:a,weight:w,wind:h,trace:buildTrace(a,w,h),weightLb:lb,labels:'NON VALIDATO PER USO OPERATIVO',anchorSource:'calibrazioni sperimentali'};}
function fmtTrack(t){return Array.isArray(t)?t.join('+'):t}
function fillTraceTable(r){return '<table>' + [
 ['Quota',r.altitude.track],
 ['Temperatura',r.trace.points.A.x.toFixed(1)+' px · '+r.altitude.alt+' ft'],
 ['Peso',r.weight.tracks.join(', ')],
 ['Vento',r.wind.tracks.map(fmtTrack).join(' / ')],
 ['Peso lb',r.weightLb.toFixed(1)],
 ['Risultato',r.ft.toFixed(1)+' ft · '+r.m.toFixed(1)+' m']
].map(([k,v])=>'<tr><th>'+k+'</th><td>'+v+'</td></tr>').join('') + '</table>'}
function trackToCanvas(pt,img){const sx=img.clientWidth/TRACK_SPACE.w, sy=img.clientHeight/TRACK_SPACE.h;return {x:pt.x*sx,y:pt.y*sy}}
// SVG overlay uses the SAME 2048×1326 source coordinates as the digitized tracks.
// Image and SVG share a single responsive container; no canvas pixel rescaling or z-index races.
function drawResultOverlay(r){
 const img=document.getElementById('graphImage'),svg=document.getElementById('overlay');
 if(!img||!svg)return;
 if(svg.namespaceURI!=='http://www.w3.org/2000/svg')throw new Error('Overlay SVG non presente; ricaricare la pagina');
 const p=r.trace.points;
 const W=img.getBoundingClientRect().width, H=img.getBoundingClientRect().height;
 if(!W||!H)return;
 svg.style.width=W+'px';svg.style.height=H+'px';
 svg.setAttribute('viewBox','0 0 2048 1326');
 const segs=[['A','B','#1676d2',false],['B','C','#1676d2',true],['C','D','#e33626',false],['D','E','#e33626',true],['E','F','#8c1fa7',false],['F','G','#187f4a',true]];
 const f=x=>Number(x).toFixed(2);
 const paths=segs.map(([a,b,c,d])=>`<line x1="${f(p[a].x)}" y1="${f(p[a].y)}" x2="${f(p[b].x)}" y2="${f(p[b].y)}" stroke="${c}" stroke-width="8" stroke-linecap="round" ${d?'stroke-dasharray="18 13"':''}/>`).join('');
 const pts=Object.entries(p).map(([n,v])=>`<circle cx="${f(v.x)}" cy="${f(v.y)}" r="11" fill="white" stroke="#102c40" stroke-width="4"/><text x="${f(v.x+16)}" y="${f(v.y-16)}" fill="#102c40" font-size="31" font-weight="bold" paint-order="stroke" stroke="white" stroke-width="5">${n}</text>`).join('');
 const fx=Math.max(25,p.G.x-230),fy=Math.max(28,p.G.y-95);
 const label=`<rect x="${f(fx)}" y="${f(fy)}" width="245" height="66" rx="11" fill="white" fill-opacity=".95" stroke="#187f4a" stroke-width="4"/><text x="${f(fx+12)}" y="${f(fy+43)}" fill="#102c40" font-weight="bold" font-size="34">${r.ft.toFixed(0)} ft / ${r.m.toFixed(0)} m</text>`;
 svg.innerHTML=`<g>${paths}${pts}${label}</g>`;
 document.getElementById('graphNote').textContent='Spezzata A–G visualizzata (versione SVG). Fonte: coordinate del calcolo; scopo diagnostico.';
}
function clearOverlay(){const svg=document.getElementById('overlay');if(svg)svg.replaceChildren()}
async function main(){const out=document.getElementById('status');try{tracks=await (await fetch('tracks.json')).json();out.textContent='Motore geometrico caricato'}catch(e){out.textContent='Impossibile caricare le curve: serve un server HTTP/HTTPS';out.className='status fail';return}
 const form=document.getElementById('calc'); const img=document.getElementById('graphImage');
 function recalc(ev){ if(ev) ev.preventDefault(); const params={alt:+document.getElementById('alt').value,temp:+document.getElementById('temp').value,mass:+document.getElementById('mass').value,wind:+document.getElementById('wind').value};try{const r=compute(params);document.getElementById('status').textContent='STIMA SPERIMENTALE — NON OPERATIVA';document.getElementById('status').className='status ok';document.getElementById('meters').textContent=r.m.toFixed(1)+' m';document.getElementById('feet').textContent=r.ft.toFixed(1)+' ft';document.getElementById('reason').textContent='La spezzata sul grafico permette un controllo visivo del percorso di lettura.';document.getElementById('trace').innerHTML=fillTraceTable(r);const qi=document.getElementById('quickInfo');qi.hidden=false;qi.innerHTML='<b>Percorso:</b> A→B verticale sulla temperatura, B→C trasferimento al blocco peso, C→D lettura del peso, D→E trasferimento al vento, E→F lettura del vento, F→G lettura finale della distanza.';try{drawResultOverlay(r)}catch(renderError){console.error('Errore visualizzazione SVG:',renderError);document.getElementById('graphNote').textContent='Calcolo eseguito; impossibile disegnare il tracciato: '+renderError.message;}}catch(e){document.getElementById('status').textContent='CALCOLO BLOCCATO — DATI INSUFFICIENTI';document.getElementById('status').className='status fail';document.getElementById('meters').textContent='—';document.getElementById('feet').textContent='';document.getElementById('trace').textContent='';document.getElementById('reason').textContent=e.message;const qi=document.getElementById('quickInfo');qi.hidden=false;qi.textContent='Nessuna spezzata visualizzata perché il motore ha bloccato il calcolo.';clearOverlay()}}
 form.addEventListener('submit',recalc); ['alt','temp','mass','wind'].forEach(id=>['input','change'].forEach(ev=>document.getElementById(id).addEventListener(ev,()=>form.requestSubmit()))); img.addEventListener('load',()=>form.requestSubmit()); window.addEventListener('resize',()=>{ try{form.requestSubmit()}catch(_){}}); form.requestSubmit();}
if(typeof document!=='undefined'){main();if('serviceWorker' in navigator && location.protocol==='https:')navigator.serviceWorker.register('service-worker.js').catch(()=>{});}if(typeof module!=='undefined')module.exports={compute,setTracks:t=>tracks=t,MissingGeometry};