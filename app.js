'use strict';
// v0.1: Provisional engineering surrogate, NOT a certified POH lookup.
// One manufacturer example is reproduced for each flap setting.
const FT_TO_M = 0.3048;
const LBS_TO_KG = 0.45359237;
const REFERENCE_KG = 2400 * LBS_TO_KG;
const examples = {
  '0':  {distanceFeet: 1100, wind: 8, source: 'POH VB-1120 figura 5-11'},
  '25': {distanceFeet: 950,  wind: 10, source: 'POH VB-1120 figura 5-13'}
};
const form = document.getElementById('calc');
const distance = document.getElementById('distance');
const explain = document.getElementById('explain');
const issues = document.getElementById('issues');
const formatter = new Intl.NumberFormat('it-IT', {maximumFractionDigits:0});
function provisionalEstimate(alt, temp, weight, wind, flaps) {
  const ref = examples[flaps];
  // Hypothetical scaling: altitude, temperature, mass, wind correction.
  // All coefficients below are experimental and MUST be replaced with
  // digitized, validated performance curves before operational use.
  const densityAltitudeChange = (alt - 2000) + 120 * (temp - 21);
  const atmospheric = Math.exp(0.000092 * densityAltitudeChange);
  const mass = Math.pow(weight / REFERENCE_KG, 2.0);
  const windFactor = Math.max(0.4, 1 - 0.034 * (wind - ref.wind));
  return ref.distanceFeet * FT_TO_M * atmospheric * mass * windFactor;
}
function calculate(event) {
  event?.preventDefault();
  const flaps = form.elements.flaps.value;
  const alt = Number(document.getElementById('alt').value);
  const temp = Number(document.getElementById('temp').value);
  const weight = Number(document.getElementById('weight').value);
  const wind = Number(document.getElementById('wind').value);
  const fields = [alt,temp,weight,wind];
  if (fields.some(n => !Number.isFinite(n)) || ["alt","temp","weight","wind"].some(id => document.getElementById(id).value.trim()==='')) {
    distance.textContent='—'; explain.textContent='Completa tutti i campi con valori numerici.'; issues.hidden=true; return;
  }
  const problems=[];
  if(alt<0 || alt>7000) problems.push('Quota pressione fuori dall’intervallo sperimentale (0–7000 ft).');
  if(temp < -40 || temp > 40) problems.push('Temperatura fuori dall’intervallo sperimentale (−40 / +40 °C).');
  if(weight < 900 || weight > 1157) problems.push('Massa fuori dall’intervallo sperimentale (900–1157 kg).');
  if(wind < -10 || wind > 15) problems.push('Vento fuori dall’intervallo sperimentale (−10 / +15 kt).');
  if(problems.length) {
    distance.textContent='—'; explain.textContent='Calcolo bloccato: modifica gli input fuori intervallo.';
    issues.innerHTML=problems.map(p=>'<p>'+p+'</p>').join(''); issues.hidden=false; return;
  }
  issues.hidden=true;
  const meters = provisionalEstimate(alt,temp,weight,wind,flaps);
  distance.textContent=formatter.format(meters);
  const isReference = alt===2000 && temp===21 && Math.abs(weight-REFERENCE_KG)<0.6 && wind===examples[flaps].wind;
  explain.textContent = isReference
   ? 'Condizioni coincidenti (entro arrotondamento del peso) con un esempio del POH. Risultato convertito in metri; NON VALIDATO come app.'
   : 'STIMA DA MODELLO PROVVISORIO: coefficienti non verificati contro tutte le curve del POH. NON UTILIZZARE PER OPERAZIONI DI VOLO.';
}
form.addEventListener('submit', calculate);
form.querySelectorAll('input').forEach(el=>el.addEventListener('change', calculate));
calculate();
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(()=>{}));
}
