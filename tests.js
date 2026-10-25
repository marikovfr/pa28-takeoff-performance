// v0.3 - regression on DOCUMENTED POH examples, not certification tests.
const assert=require('node:assert/strict');
const {compute,ANCHORS,FT_TO_M}=require('./engine.js');
for(const flap of ['0','25']){
 const r=compute({...ANCHORS[flap],weightKg:1089,flaps:flap});
 assert.equal(r.kind,'poh-example');
 assert.equal(r.meters,ANCHORS[flap].rollFt*FT_TO_M);
}
const base={altFt:2000,oatC:21,weightKg:1089,windKt:8,flaps:'0'};
assert.equal(compute({...base,altFt:3000}).kind,'unavailable');
assert.equal(compute({...base,altFt:3000},{allowExperimental:true}).kind,'provisional');
assert.equal(compute({...base,altFt:8000},{allowExperimental:true}).kind,'invalid');
assert.equal(compute({...base,weightKg:NaN}).kind,'invalid');
assert.equal(compute({...base,flaps:'40'}).kind,'invalid');
assert.equal(compute({...base,windKt:-12}).kind,'invalid');
console.log('8 test OK — test del software, NON validazione del modello di volo.');
