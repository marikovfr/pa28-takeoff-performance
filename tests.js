// Run with: node tests.js. Tests are NOT proof of operational validity.
const assert=require('node:assert/strict');
const {compute}=require('./engine.js');
const baseline={altFt:2000,oatC:21,weightKg:1089,windKt:8,flaps:'0'};
const a=compute(baseline);
assert.equal(a.kind,'poh-example');
assert.equal(Math.round(a.meters),335);
const b=compute({...baseline,flaps:'25',windKt:10});
assert.equal(b.kind,'poh-example');
assert.equal(Math.round(b.meters),290);
assert.equal(compute({...baseline,altFt:3000}).kind,'provisional');
assert.equal(compute({...baseline,altFt:8000}).kind,'invalid');
assert.equal(compute({...baseline,weightKg:NaN}).kind,'invalid');
assert.equal(compute({...baseline,flaps:'40'}).kind,'invalid');
console.log('6 controlli superati — NON VALIDATE PER USO OPERATIVO');
