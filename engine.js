/* PA-28-181 ground-roll experimental engine, v0.3.
 * NOT VALIDATED FOR OPERATIONAL USE.
 * Manufacturer examples are exact documented anchor points ONLY.
 * All other distances are provisional surrogate estimates, NOT POH interpolation.
 */
(function(root, factory) {
  const engine = factory();
  if (typeof module === 'object' && module.exports) module.exports = engine;
  else root.PA28Engine = engine;
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';
  const FT_TO_M = 0.3048;
  const LB_TO_KG = 0.45359237;
  const REFERENCE_KG = 2400 * LB_TO_KG;
  const ANCHORS = Object.freeze({
    '0': Object.freeze({altFt:2000, oatC:21, weightKg:REFERENCE_KG, windKt:8, rollFt:1100, fig:'5-11'}),
    '25': Object.freeze({altFt:2000, oatC:21, weightKg:REFERENCE_KG, windKt:10, rollFt:950, fig:'5-13'})
  });
  const RANGE = Object.freeze({altFt:[0,7000], oatC:[-40,40], weightKg:[900,1157], windKt:[-10,15]});
  function compute(data, options = {}) {
    const {altFt,oatC,weightKg,windKt,flaps} = data;
    const items = {altFt,oatC,weightKg,windKt};
    const errors = [];
    if (!Object.hasOwn(ANCHORS,flaps)) errors.push('Configurazione flap non supportata.');
    for(const [key,value] of Object.entries(items)) {
      const [min,max] = RANGE[key];
      if (typeof value !== 'number' || !Number.isFinite(value)) errors.push(`${key}: valore numerico mancante.`);
      else if(value < min || value > max) errors.push(`${key}: fuori dall’intervallo del prototipo (${min}–${max}).`);
    }
    if(errors.length) return {kind:'invalid', meters:null, errors};
    const ref=ANCHORS[flaps];
    const matches=altFt===ref.altFt && oatC===ref.oatC && Math.abs(weightKg-ref.weightKg)<0.6 && windKt===ref.windKt;
    if(matches) return {kind:'poh-example', meters:ref.rollFt*FT_TO_M, errors:[], reference:ref.fig};
    if (options.allowExperimental !== true) return {kind:'unavailable',meters:null,errors:[],reference:ref.fig};
    // EXPERIMENTAL ONLY: retained to compare future digitized data; never a POH interpolation.
    // v0.1 provisional approximation retained visibly as a NON-POH estimate.
    // No validation can be inferred from agreement at manufacturer anchor points.
    const densityChange=(altFt-ref.altFt)+120*(oatC-ref.oatC);
    const atmospheric=Math.exp(0.000092*densityChange);
    const mass=Math.pow(weightKg/ref.weightKg,2);
    const windFactor=Math.max(0.4,1-0.034*(windKt-ref.windKt));
    return {kind:'provisional',meters:ref.rollFt*FT_TO_M*atmospheric*mass*windFactor,errors:[],reference:ref.fig};
  }
  return Object.freeze({compute, ANCHORS, RANGE, FT_TO_M, LB_TO_KG, version:"0.3"});
});
