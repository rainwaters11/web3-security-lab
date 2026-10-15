import { test } from 'node:test';
import assert from 'node:assert/strict';
import { scenarios, ready, assess, loadProgress } from './model.mjs';
test('illustrative rollback restores funds and both credits after temporary transfers',()=>{
 const s=scenarios.find(s=>s.id==='reentrant');
 assert.equal(s.steps[4].received,2); assert.equal(s.steps[5].alice,0);
 const end=s.steps.at(-1);assert.deepEqual([end.vault,end.alice,end.bob,end.received],[3,1,2,0]);
});
test('completion needs final step, correct cause, and honest evidence classification',()=>{
 const s=scenarios[2], a={prediction:'I predict an arithmetic failure.',invariant:'The vault must cover all credit.',explanation:'The outer subtraction fails after the inner call spends the credit.',outcome:'panic',evidence:'illustration'};
 assert.equal(assess(s,a,0).ok,false);
 assert.equal(assess(s,{...a,evidence:'verified'},s.steps.length-1).ok,false);
 assert.equal(assess(s,{...a,outcome:'theft'},s.steps.length-1).ok,false);
 assert.equal(assess(s,a,s.steps.length-1).ok,true);
 assert.equal(ready({...a,invariant:''}),false);
});
test('normal and excess paths have distinct final accounting',()=>{
 const a=scenarios[0].steps.at(-1),b=scenarios[1].steps.at(-1);
 assert.deepEqual([a.vault,a.alice,a.bob],[2,0,2]);assert.deepEqual([b.vault,b.alice,b.bob],[3,1,2]);
});
test('unavailable or malformed local storage does not crash the game',()=>{
 assert.deepEqual(loadProgress(null),{});
 assert.deepEqual(loadProgress({getItem:()=>'{'}),{});
 assert.deepEqual(loadProgress({getItem:()=>'{"normal":{"prediction":"kept"},"unrelated":{}}'}),{normal:{prediction:'kept'}});
});
