"use strict";
(() => {
 const LB_PER_KG=2.20462262185,FUEL_LB_PER_GAL=6,OIL_LB_PER_GAL=7.5;
 const NORMAL=[[84,1400],[84,1650],[85.9,1975],[92.1,2400],[94.5,2400],[95.9,2200],[95.9,1400]];
 const UTILITY=[[84,1400],[84,1650],[85.8,1950],[86.5,1950],[86.5,1400]];
 const ids=['wbPilot','wbFront','wbRear','wbFuel','wbBaggage','wbOil'];
 const $=id=>document.getElementById(id);const fmt=(v,n=1)=>Number(v).toFixed(n);
 function insidePolygon(x,y,poly){let inside=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const [xi,yi]=poly[i], [xj,yj]=poly[j];const dx=xj-xi,dy=yj-yi;const cross=(x-xi)*dy-(y-yi)*dx;if(Math.abs(cross)<1e-8&&x>=Math.min(xi,xj)-1e-8&&x<=Math.max(xi,xj)+1e-8&&y>=Math.min(yi,yj)-1e-8&&y<=Math.max(yi,yj)+1e-8)return true;if((yi>y)!==(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)inside=!inside;}return inside;}
 function renderChart(cg,weight){const svg=$('wbCgChart'),NS='http://www.w3.org/2000/svg';const w=760,h=440,margin={l:62,r:24,t:22,b:53};const xmin=82,xmax=98,ymin=1400,ymax=2500;
 const px=x=>margin.l+(x-xmin)/(xmax-xmin)*(w-margin.l-margin.r);
 const py=y=>h-margin.b-(y-ymin)/(ymax-ymin)*(h-margin.t-margin.b);
 const element=(tag,attr,text)=>{const e=document.createElementNS(NS,tag);for(const [k,v] of Object.entries(attr||{}))e.setAttribute(k,String(v));if(text!==undefined)e.textContent=text;svg.appendChild(e);return e;};
 svg.replaceChildren();
 for(let x=82;x<=98;x+=2){element('line',{x1:px(x),x2:px(x),y1:py(1400),y2:py(2500),class:'gridline'});element('text',{x:px(x),y:h-25,'text-anchor':'middle','font-size':13,fill:'#475569'},String(x));}
 for(let y=1400;y<=2400;y+=200){element('line',{x1:px(82),x2:px(98),y1:py(y),y2:py(y),class:'gridline'});element('text',{x:margin.l-10,y:py(y)+4,'text-anchor':'end','font-size':13,fill:'#475569'},String(y));}
 element('text',{x:w/2,y:h-4,'text-anchor':'middle','font-size':14,fill:'#253955'},'C.G. — inches aft datum');
 element('text',{x:13,y:h/2,transform:`rotate(-90 13 ${h/2})`,'text-anchor':'middle','font-size':14,fill:'#253955'},'Weight — lb');
 const poly=(coords,css)=>element('polygon',{points:coords.map(([x,y])=>`${px(x)},${py(y)}`).join(' '),class:css});
 poly(NORMAL,'outlineNormal');poly(UTILITY,'outlineUtility');
 element('text',{x:px(93),y:py(2380)-10,'font-size':14,'font-weight':'bold',fill:'#2468c9'},'Normal');
 element('text',{x:px(84.2),y:py(1975)-12,'font-size':14,'font-weight':'bold',fill:'#d27809'},'Utility');
 if(Number.isFinite(cg)&&Number.isFinite(weight)){
  const x=px(cg),y=py(weight);element('line',{x1:x-12,x2:x+12,y1:y,y2:y,class:'current'});element('line',{x1:x,x2:x,y1:y-12,y2:y+12,class:'current'});
  const tx=Math.min(w-170,Math.max(65,x+15)),ty=Math.min(h-70,Math.max(24,y-16));element('text',{x:tx,y:ty,'font-size':14,'font-weight':'bold',fill:'#b91c1c'},`${fmt(cg,2)} in / ${fmt(weight,1)} lb`);
 }
 }
 function calculate(){const [pilot,front,rear,fuel,bag,oil]=['wbPilot','wbFront','wbRear','wbFuel','wbBaggage','wbOil'].map(id=>Number($(id).value));
 const inputOK=[pilot,front,rear,fuel,bag,oil].every(x=>Number.isFinite(x)&&x>=0);
 const oilLb=oil/4*OIL_LB_PER_GAL;
 $('wbOilInfo').textContent=`${fmt(oil,2)} qt · ${fmt(oilLb,3)} lb`;
 const rows=[
  {name:'Licensed empty weight',weight:1467.6,arm:86.5,moment:126947},
  {name:'Pilota + passeggero ant.',weight:(pilot+front)*LB_PER_KG,arm:85.5},
  {name:'Passeggero posteriore',weight:rear*LB_PER_KG,arm:118.1},
  {name:'Carburante',weight:fuel*FUEL_LB_PER_GAL,arm:95},
  {name:'Bagaglio',weight:bag*LB_PER_KG,arm:142.8},
  {name:'Olio',weight:oilLb,arm:32.5}];
 rows.forEach(r=>{if(r.moment===undefined)r.moment=r.weight*r.arm});
 const total=rows.reduce((a,r)=>a+r.weight,0),moment=rows.reduce((a,r)=>a+r.moment,0),cg=moment/total,margin=2400-total;
 const normal=insidePolygon(cg,total,NORMAL),utility=insidePolygon(cg,total,UTILITY);
 const issues=[];if(!inputOK)issues.push('Dati non validi.');if(fuel>50)issues.push('Carburante oltre 50 US gal.');if(bag*LB_PER_KG>200)issues.push('Bagaglio oltre 200 lb.');if(total>2400)issues.push('Peso oltre 2400 lb.');if(oil<6||oil>8)issues.push('Olio fuori da 6–8 qt.');
 const utilityAllowed=rear===0&&bag===0;
 if(!normal)issues.push('Fuori inviluppo Normal.');
 const utilityOK=utility&&utilityAllowed;
 $('wbTable').innerHTML=rows.map(r=>`<tr><td>${r.name}</td><td>${fmt(r.weight)}</td><td>${fmt(r.arm)}</td><td>${fmt(r.moment)}</td></tr>`).join('')+`<tr><th>TOTALE</th><th>${fmt(total)}</th><th>${fmt(cg,2)}</th><th>${fmt(moment)}</th></tr>`;
 $('wbTotal').textContent=fmt(total/LB_PER_KG)+' kg';$('wbTotalLb').textContent=fmt(total)+' lb';$('wbCG').textContent=fmt(cg,2)+' in';$('wbMargin').textContent=fmt(margin)+' lb';
 $('wbStatus').textContent=(issues.length?issues.join(' ')+' ':'')+`Inviluppo Normal: ${normal?'entro':'fuori'}. Utility: ${utilityOK?'entro':'fuori / non ammessa'}. POH e documenti I-SABY obbligatori per la verifica operativa. NON VALIDATO PER USO OPERATIVO.`;
 $('wbStatus').style.borderColor=issues.length?'#c3452f':'#2b9073';
 renderChart(cg,total);
 return{total,moment,cg,normal,utility,kg:total/LB_PER_KG,valid:inputOK&&fuel<=50&&bag*LB_PER_KG<=200&&total<=2400&&oil>=6&&oil<=8&&normal};}
 ids.forEach(id=>$(id).addEventListener('input',calculate));
 $('wbSendMass').addEventListener('click',()=>{const r=calculate();if(!r.valid){alert('Configurazione non conforme ai controlli disponibili: verificare peso e C.G. con il POH e la documentazione di I-SABY.');return;}const el=$('mass');el.value=r.kg.toFixed(2);el.dispatchEvent(new Event('input',{bubbles:true}));$('calc').scrollIntoView({behavior:'smooth',block:'start'});});
 calculate();
 if(typeof module!=='undefined')module.exports={insidePolygon,NORMAL,UTILITY};
})();