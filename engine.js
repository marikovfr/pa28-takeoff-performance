"use strict";
const APP_VERSION='0.14';
const ALT={7000:['A1','A5'],6000:['A2','A7'],5000:['A3','A9'],4000:['A4','A11'],3000:['A6','A12'],2000:['A8','A14'],1000:['A10','A15'],0:['A13','A16']};
const P=['P1','P2','P3','P4','P5','P6','P7','P8'];
const H=[['H3','H4','H7'],['H5','H6','H9'],['H8','H10','H12'],['H11','H13'],['H14','H15'],['H16','H17'],['H18','H19'],['H20']];
const X={tempRef21:806, tempScalePxPerC:6, weightEntry:1021, windEntry:1482, wind10:1598.3333333, distanceAxis:1663};
const Y={graphBottom:1087, ft400:1088, ft600:1023};
const TRACK_SPACE={w:2048,h:1326};
let tracks=null;
class MissingGeometry extends Error{}
function lineY(id,x){const r=tracks[id];if(!r)throw new MissingGeometry('Traccia assente: '+id);const [a,b,c,d]=[r.x1_px,r.y1_px,r.x2_px,r.y2_px];if(a===c)throw new MissingGeometry('Traccia verticale');return b+(x-a)*(d-b)/(c-a)}
function lineSlope(id){const r=tracks[id];return (r.y2_px-r.y1_px)/(r.x2_px-r.x1_px)}
function bounds(id,x,tolerance=0){const r=tracks[id];return x>=Math.min(r.x1_px,r.x2_px)-tolerance&&x<=Math.max(r.x1_px,r.x2_px)+tolerance}
function chainY(ids,x){const parts=ids.map(id=>{let r=tracks[id];return {id,lo:Math.min(r.x1_px,r.x2_px),hi:Math.max(r.x1_px,r.x2_px)}}).sort((a,b)=>a.lo-b.lo);
 for(let p of parts)if(x>=p.lo&&x<=p.hi)return lineY(p.id,x);
 for(let i=0;i<parts.length-1;i++){const a=parts[i],b=parts[i+1];if(a.hi<=x&&x<=b.lo&&b.lo-a.hi<=8){const ya=lineY(a.id,a.hi),yb=lineY(b.id,b.lo);if(Math.hypot(b.lo-a.hi,yb-ya)<=8)return ya+(x-a.hi)*(yb-ya)/(b.lo-a.hi)}}
 throw new MissingGeometry('Segmento del vento non disponibile a x='+x.toFixed(1)+' per '+ids.join('+'))}
function altitudeCurveValue(ids,x){
 const segs=ids.map(id=>{const r=tracks[id];return {id,lo:Math.min(r.x1_px,r.x2_px),hi:Math.max(r.x1_px,r.x2_px),ylo:lineY(id,Math.min(r.x1_px,r.x2_px)),yhi:lineY(id,Math.max(r.x1_px,r.x2_px))}}).sort((a,b)=>a.lo-b.lo);
 const inRange=segs.filter(s=>x>=s.lo&&x<=s.hi);
 if(inRange.length===1)return {y:lineY(inRange[0].id,x),track:inRange[0].id,extended:false};
 if(inRange.length>1){const ys=inRange.map(s=>lineY(s.id,x));return {y:ys.reduce((a,b)=>a+b)/ys.length,track:inRange.map(s=>s.id).join('+'),extended:false};}
 // bridge small gaps between split segments
 for(let i=0;i<segs.length-1;i++){
   const a=segs[i],b=segs[i+1];
   if(a.hi<=x&&x<=b.lo&&b.lo-a.hi<=14){
     const ya=lineY(a.id,a.hi), yb=lineY(b.id,b.lo);
     return {y:ya+(x-a.hi)*(yb-ya)/(b.lo-a.hi),track:a.id+'+'+b.id,extended:false};
   }
 }
 // requested extension downward at low temp / low altitude: extrapolate the lower segment down-left until graph bottom.
 if(x<segs[0].lo){
   let best=segs.slice().sort((a,b)=>Math.max(lineY(a.id,a.lo),lineY(a.id,a.hi))-Math.max(lineY(b.id,b.lo),lineY(b.id,b.hi))).at(-1);
   const y=lineY(best.id,x);
   if(segs[0].lo-x<=65 && y<=Y.graphBottom+18) return {y,track:best.id+'(ext)',extended:true};
 }
 if(x>segs[segs.length-1].hi){
   let best=segs[0];
   const y=lineY(best.id,x);
   if(x-segs[segs.length-1].hi<=35 && y>=0 && y<=TRACK_SPACE.h) return {y,track:best.id+'(ext)',extended:true};
 }
 throw new MissingGeometry('Curve della quota insufficienti per interpolare questa combinazione');
}
function altitudeAt(q,t){if(!(q>=0&&q<=7000&&t>=-40&&t<=35))throw new MissingGeometry('Quota/temperatura fuori dal campo previsto');
 const x=X.tempRef21+(t-21)*X.tempScalePxPerC;let data=[];for(const [alt,ids] of Object.entries(ALT)){try{const v=altitudeCurveValue(ids,x);data.push({alt:+alt,y:v.y,track:v.track,extended:v.extended});}catch(_){}}
 data.sort((a,b)=>a.alt-b.alt);const exact=data.find(v=>v.alt===q);if(exact)return {...exact,x};
 for(let i=0;i<data.length-1;i++){const a=data[i],b=data[i+1];if(b.alt-a.alt===1000&&a.alt<q&&q<b.alt){const t=(q-a.alt)/1000;return {alt:q,y:a.y+(b.y-a.y)*t,track:a.track+'/'+b.track,x,extended:!!(a.extended||b.extended)}}}
 throw new MissingGeometry('Curve della quota insufficienti per interpolare questa combinazione')}
function pair(y,ids,xin,xout,fn,label,allowOuter=false){const vals=ids.map((id,i)=>({id:String(i+1),track:id,y:fn(id,xin),i})).sort((a,b)=>a.y-b.y);let matches=[];for(let i=0;i<vals.length-1;i++){let a=vals[i],b=vals[i+1];if(a.y<=y&&y<=b.y)matches.push([a,b])}let a,b;if(matches.length===1){[a,b]=matches[0];}else if(allowOuter && y<vals[0].y){a=vals[0];b=vals[1];}else if(allowOuter && y>vals.at(-1).y){a=vals.at(-2);b=vals.at(-1);}else{throw new MissingGeometry(label+': ingresso fuori dalla famiglia di curve')}if(Math.abs(a.i-b.i)!==1)throw new MissingGeometry(label+': curve non adiacenti');const t=(y-a.y)/(b.y-a.y);if(t<0||t>1)throw new MissingGeometry(label+': oltre le curve esterne (estrapolazione non consentita)');return {tracks:[a.track,b.track],fraction:t,y:(1-t)*fn(a.track,xout)+t*fn(b.track,xout)} }
function weightAt(y,lb){if(lb<1980||lb>2550)throw new MissingGeometry('Peso fuori dalla scala rappresentata');
 // visual calibration slightly revised so the red trace sits more parallel to the user-drawn family.
 const x=1112.1818181818182+(2400-lb)*0.565;
 const read=(id,z)=>lineY(id,z);const w=pair(y,P,X.weightEntry,x,read,'Peso');for(const id of w.tracks)if(!bounds(id,X.weightEntry,8)||!bounds(id,x,8))throw new MissingGeometry('Peso: tratto mancante '+id);return {...w,x}}
function headwindAt(y,wind){if(wind<0)throw new MissingGeometry('Vento in coda non ancora calibrato: calcolo bloccato'); if(wind>15)throw new MissingGeometry('Vento frontale oltre 15 kt: fuori dal campo attuale');const x=X.windEntry+(wind/10)*(X.wind10-X.windEntry);return {...pair(y,H,X.windEntry,x,chainY,'Vento frontale'),x}}
function buildTrace(a,w,h){return {points:{A:{x:a.x,y:Y.graphBottom,label:'A'},B:{x:a.x,y:a.y,label:'B'},C:{x:X.weightEntry,y:a.y,label:'C'},D:{x:w.x,y:w.y,label:'D'},E:{x:X.windEntry,y:w.y,label:'E'},F:{x:h.x,y:h.y,label:'F'},G:{x:X.distanceAxis,y:h.y,label:'G'}},resultY:h.y,weightFraction:w.fraction,weightTracks:w.tracks,windFraction:h.fraction,windTracks:h.tracks}}
function compute({alt,temp,mass,wind}){for(let v of [alt,temp,mass,wind])if(!Number.isFinite(v))throw new MissingGeometry('Dati numerici mancanti');if(mass<900||mass>1157)throw new MissingGeometry('Massa fuori dal campo previsto');const lb=mass*2.20462262185;const a=altitudeAt(alt,temp),w=weightAt(a.y,lb),h=headwindAt(w.y,wind);const ft=400+200*(Y.ft400-h.y)/(Y.ft400-Y.ft600);if(!Number.isFinite(ft)||ft<=0||ft>3500)throw new MissingGeometry('Intersezione distanza fuori dalla scala plausibile');return {ft,m:ft*.3048,altitude:a,weight:w,wind:h,trace:buildTrace(a,w,h),weightLb:lb,labels:'NON VALIDATO PER USO OPERATIVO',anchorSource:'calibrazioni sperimentali'};}
function fmtTrack(t){return Array.isArray(t)?t.join('+'):t}
function fillTraceTable(r){return '<table>' + [
 ['Quota',r.altitude.track + (r.altitude.extended?' · estesa':'')],
 ['Temperatura',r.trace.points.A.x.toFixed(1)+' px · '+r.altitude.alt+' ft'],
 ['Peso',r.weight.tracks.join(', ')],
 ['Vento',r.wind.tracks.map(fmtTrack).join(' / ')],
 ['Peso lb',r.weightLb.toFixed(1)],
 ['Risultato',r.ft.toFixed(1)+' ft · '+r.m.toFixed(1)+' m']
].map(([k,v])=>'<tr><th>'+k+'</th><td>'+v+'</td></tr>').join('') + '</table>'}
function interpBetween(trackA,trackB,fraction,x){return (1-fraction)*lineY(trackA,x)+fraction*lineY(trackB,x)}
function weightPathPoints(r){const [a,b]=r.weight.tracks;const pts=[];const x0=X.weightEntry, x1=r.weight.x; const n=10; for(let i=0;i<=n;i++){const x=x0+(x1-x0)*(i/n); pts.push({x,y:interpBetween(a,b,r.weight.fraction,x)})} return pts;}
function windPathPoints(r){const pts=[]; const x0=X.windEntry, x1=r.wind.x; const n=10; for(let i=0;i<=n;i++){const x=x0+(x1-x0)*(i/n); const y=(1-r.wind.fraction)*chainY(r.wind.tracks[0],x)+r.wind.fraction*chainY(r.wind.tracks[1],x); pts.push({x,y});} return pts;}
function svgPolyline(points,color,dashed=false){const f=n=>Number(n).toFixed(2);const d=points.map((p,i)=>(i?'L':'M')+f(p.x)+' '+f(p.y)).join(' ');return `<path d="${d}" fill="none" stroke="${color}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" ${dashed?'stroke-dasharray="18 13"':''}/>`;}
function drawResultOverlay(r){
 const img=document.getElementById('graphImage'),svg=document.getElementById('overlay');
 if(!img||!svg)return;
 if(svg.namespaceURI!=='http://www.w3.org/2000/svg')throw new Error('Overlay SVG non presente; ricaricare la pagina');
 const p=r.trace.points;
 const W=img.getBoundingClientRect().width, H=img.getBoundingClientRect().height;
 if(!W||!H)return;
 svg.style.width=W+'px';svg.style.height=H+'px';
 svg.setAttribute('viewBox','0 0 2048 1326');
 const straight=[['A','B','#1676d2',false],['B','C','#1676d2',true],['D','E','#e33626',true],['F','G','#187f4a',true]];
 const straightSvg=straight.map(([a,b,c,d])=>`<line x1="${p[a].x.toFixed(2)}" y1="${p[a].y.toFixed(2)}" x2="${p[b].x.toFixed(2)}" y2="${p[b].y.toFixed(2)}" stroke="${c}" stroke-width="8" stroke-linecap="round" ${d?'stroke-dasharray="18 13"':''}/>`).join('');
 const weightSvg=svgPolyline(weightPathPoints(r),'#e33626',false);
 const windSvg=svgPolyline(windPathPoints(r),'#8c1fa7',false);
 const pts=Object.entries(p).map(([n,v])=>`<circle cx="${v.x.toFixed(2)}" cy="${v.y.toFixed(2)}" r="11" fill="white" stroke="#102c40" stroke-width="4"/><text x="${(v.x+16).toFixed(2)}" y="${(v.y-16).toFixed(2)}" fill="#102c40" font-size="31" font-weight="bold" paint-order="stroke" stroke="white" stroke-width="5">${n}</text>`).join('');
 const boxX=Math.min(TRACK_SPACE.w-255, Math.max(25,p.G.x-120));
 const preferredY=p.G.y+24;
 const boxY=(preferredY+66<=TRACK_SPACE.h-8)?preferredY:Math.max(20,p.G.y-95);
 const label=`<rect x="${boxX.toFixed(2)}" y="${boxY.toFixed(2)}" width="245" height="66" rx="11" fill="white" fill-opacity=".95" stroke="#187f4a" stroke-width="4"/><text x="${(boxX+12).toFixed(2)}" y="${(boxY+43).toFixed(2)}" fill="#102c40" font-weight="bold" font-size="34">${r.ft.toFixed(0)} ft / ${r.m.toFixed(0)} m</text>`;
 svg.innerHTML=`<g>${straightSvg}${weightSvg}${windSvg}${pts}${label}</g>`;
 document.getElementById('graphNote').textContent='Spezzata A–G visualizzata. La tratta del peso deriva dall’interpolazione delle due curve rosse selezionate; estensioni delle quote limitate a 65 px e al bordo inferiore. Dove peso o vento escono dal grafico il calcolo resta bloccato.';
}
function clearOverlay(){const svg=document.getElementById('overlay');if(svg)svg.replaceChildren()}
async function main(){const out=document.getElementById('status');try{tracks=await (await fetch('tracks.json')).json();out.textContent='Motore geometrico caricato'}catch(e){out.textContent='Impossibile caricare le curve: serve un server HTTP/HTTPS';out.className='status fail';return}
 const form=document.getElementById('calc'); const img=document.getElementById('graphImage');
 function recalc(ev){ if(ev) ev.preventDefault(); const params={alt:+document.getElementById('alt').value,temp:+document.getElementById('temp').value,mass:+document.getElementById('mass').value,wind:+document.getElementById('wind').value};try{const r=compute(params);document.getElementById('status').textContent='STIMA SPERIMENTALE — NON OPERATIVA';document.getElementById('status').className='status ok';document.getElementById('meters').textContent=r.m.toFixed(1)+' m';document.getElementById('feet').textContent=r.ft.toFixed(1)+' ft';document.getElementById('reason').textContent='La spezzata sul grafico permette un controllo visivo del percorso di lettura.';document.getElementById('trace').innerHTML=fillTraceTable(r);const qi=document.getElementById('quickInfo');qi.hidden=false;qi.innerHTML='<b>Percorso:</b> A→B verticale sulla temperatura, B→C trasferimento al blocco peso, C→D lungo la famiglia del peso, D→E trasferimento al vento, E→F lungo la famiglia del vento, F→G lettura finale della distanza.';try{drawResultOverlay(r)}catch(renderError){console.error('Errore visualizzazione SVG:',renderError);document.getElementById('graphNote').textContent='Calcolo eseguito; impossibile disegnare il tracciato: '+renderError.message;}}catch(e){document.getElementById('status').textContent='CALCOLO BLOCCATO — DATI INSUFFICIENTI';document.getElementById('status').className='status fail';document.getElementById('meters').textContent='—';document.getElementById('feet').textContent='';document.getElementById('trace').textContent='';document.getElementById('reason').textContent=e.message;const qi=document.getElementById('quickInfo');qi.hidden=false;qi.textContent='Nessuna spezzata visualizzata perché il motore ha bloccato il calcolo.';clearOverlay()}}
 form.addEventListener('submit',recalc); ['alt','temp','mass','wind'].forEach(id=>['input','change'].forEach(ev=>document.getElementById(id).addEventListener(ev,()=>form.requestSubmit()))); img.addEventListener('load',()=>form.requestSubmit()); window.addEventListener('resize',()=>{ try{form.requestSubmit()}catch(_){}}); form.requestSubmit();}
if(typeof document!=='undefined'){main();if('serviceWorker' in navigator && location.protocol==='https:')navigator.serviceWorker.register('service-worker.js').catch(()=>{});}if(typeof module!=='undefined')module.exports={compute,setTracks:t=>tracks=t,MissingGeometry};
