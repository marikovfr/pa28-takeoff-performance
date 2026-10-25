'use strict';
const form = document.getElementById('calc');
const distance = document.getElementById('distance');
const explain = document.getElementById('explain');
const issues = document.getElementById('issues');
const status = document.getElementById('status');
const formatter = new Intl.NumberFormat('it-IT', {maximumFractionDigits:0});
const labels = {altFt:'Quota pressione',oatC:'Temperatura',weightKg:'Peso',windKt:'Vento'};
function calculate(event) {
  event?.preventDefault();
  const ids={altFt:'alt',oatC:'temp',weightKg:'weight',windKt:'wind'};
  const values={flaps:form.elements.flaps.value};
  const missing=[];
  for(const [key,id] of Object.entries(ids)){
    const raw=document.getElementById(id).value.trim();
    if(raw==='') missing.push(labels[key]);
    values[key]=raw===''?NaN:Number(raw);
  }
  if(missing.length){
    distance.textContent='—';status.textContent='INPUT INCOMPLETI';
    explain.textContent='Compila i campi mancanti: '+missing.join(', ')+'.';issues.hidden=true;return;
  }
  const result=PA28Engine.compute(values);
  if(result.kind==='invalid'){
    distance.textContent='—';status.textContent='FUORI INTERVALLO';
    explain.textContent='Il prototipo non calcola valori fuori dagli intervalli indicati.';
    issues.replaceChildren(...result.errors.map(err=>{const p=document.createElement('p');p.textContent=err;return p;}));
    issues.hidden=false;return;
  }
  issues.hidden=true;
  distance.textContent=formatter.format(result.meters);
  if(result.kind==='poh-example'){
    status.textContent='ESEMPIO POH';
    explain.textContent=`Conversione diretta dell’esempio nel POH (fig. ${result.reference}); input arrotondato in kg. L’APP NON È VALIDATA PER USO OPERATIVO.`;
  } else {
    status.textContent='STIMA SPERIMENTALE';
    explain.textContent='STIMA NON TRATTA DAL GRAFICO POH. Formula provvisoria non verificata: NON UTILIZZARE PER OPERAZIONI DI VOLO.';
  }
}
form.addEventListener('submit',calculate);
form.querySelectorAll('input').forEach(input=>{
  input.addEventListener('input',calculate);
  input.addEventListener('change',calculate);
});
calculate();
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
 window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
}
