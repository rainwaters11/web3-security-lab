import { scenarios, glossary, ready, assess, loadProgress } from './model.mjs';
const $ = id => document.getElementById(id);
let storage; try { storage = window.localStorage; } catch { storage = null; }
let progress = loadProgress(storage), active = scenarios[0], index = 0, unlocked = false, sound = false;
let reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let audio;
function current() { return progress[active.id] ||= {}; }
function save() { try { storage.setItem('vault-room:v1', JSON.stringify(progress)); $('save-status').textContent = 'Saved in this browser · explanation awaits review'; } catch { $('save-status').textContent = 'Browser saving unavailable. Export your notes before leaving.'; } }
function sync() { for (const field of ['prediction','invariant','outcome','evidence','explanation']) current()[field] = $(field).value; current().completed = false; save(); updateCount(); }
function updateCount() { $('completion').textContent = `${scenarios.filter(s => progress[s.id]?.completed === true).length} / 3 walkthroughs completed · mastery is assessed separately`; }
function tone() { if (!sound) return; try { const Ctx = window.AudioContext || window.webkitAudioContext; audio ||= new Ctx(); audio.resume().catch(()=>{}); const o=audio.createOscillator(), g=audio.createGain(); o.connect(g);g.connect(audio.destination);o.frequency.value=440;g.gain.setValueAtTime(.035,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.13);o.start();o.stop(audio.currentTime+.14); } catch { sound=false; $('sound').textContent='Sound unavailable';$('sound').setAttribute('aria-pressed','false'); } }
function showStep() {
  const s=active.steps[index];
  for (const [id,value] of [['vault-balance',s.vault],['alice-balance',s.alice],['bob-balance',s.bob],['received-balance',s.received]]) {
    $(id).textContent = `${value} ETH`;
    if (!reduced && $(id).animate) $(id).animate([{opacity:.35,transform:'translateY(3px)'},{opacity:1,transform:'translateY(0)'}],{duration:220});
  }
  $('step-count').textContent=`STEP ${index+1} / ${active.steps.length} · ${index===active.steps.length-1?'FINAL STATE':'ILLUSTRATIVE STATE'}`;
  $('step-label').textContent=s.label;$('step-detail').textContent=s.detail;
  $('call-stack').textContent=`Nested contract-call depth: ${s.depth} ${s.depth===0?'· no active withdrawal frame':''}`;
  [...$('code').children].forEach((li,i)=>li.classList.toggle('current',i===s.line));
  $('previous').disabled=index===0;$('next').disabled=index===active.steps.length-1;
  $('progress').max=active.steps.length-1;$('progress').value=index;
  $('conclusion').hidden=index!==active.steps.length-1;
}
function selectCase(s) {
  active=s;index=0;unlocked=false;$('trace-room').hidden=true;$('conclusion').hidden=true;
  $('title').textContent=s.title;$('request').textContent=s.request;$('feedback').textContent='';
  for(const field of ['prediction','invariant','outcome','evidence','explanation']) $(field).value=typeof current()[field]==='string'?current()[field]:'';
  document.querySelectorAll('#cases button').forEach(b=>b.setAttribute('aria-current',String(b.dataset.id===s.id)));
  updateCount();
}
for(const s of scenarios){const b=document.createElement('button');b.dataset.id=s.id;const small=document.createElement('span');small.textContent=s.subtitle;const label=document.createElement('strong');label.textContent=s.title;b.append(small,label);b.addEventListener('click',()=>selectCase(s));$('cases').append(b);}
for(const field of ['prediction','invariant','explanation']) $(field).addEventListener('input',()=>{sync();if(!ready(current())){unlocked=false;$('trace-room').hidden=true;$('conclusion').hidden=true;}});
for(const field of ['outcome','evidence']) $(field).addEventListener('change',sync);
$('prediction-form').addEventListener('submit',e=>{e.preventDefault();sync();if(!ready(current()))return;unlocked=true;index=0;$('trace-room').hidden=false;showStep();tone();$('trace-room').scrollIntoView({behavior:reduced?'instant':'smooth',block:'start'});});
$('next').addEventListener('click',()=>{if(!unlocked)return;index=Math.min(index+1,active.steps.length-1);showStep();tone();});
$('previous').addEventListener('click',()=>{if(!unlocked)return;index=Math.max(0,index-1);showStep();});
$('conclusion-form').addEventListener('submit',e=>{e.preventDefault();sync();const r=assess(active,current(),index);$('feedback').textContent=r.message;current().completed=r.ok;current().explanationReview='pending';current().solidityEvidence='unverified';current().updatedAt=new Date().toISOString();save();updateCount();if(r.ok)tone();});
$('hint').addEventListener('click',()=>{current().hints=(Number(current().hints)||0)+1;save();$('feedback').textContent='Look at the final operation and resulting balances. Did the walkthrough come from executed Solidity, or from an authored illustration?';});
function terms(){const q=$('search').value.toLowerCase().trim();$('terms').replaceChildren();for(const [term,definition] of glossary.filter(x=>x.join(' ').toLowerCase().includes(q))){const a=document.createElement('article'),h=document.createElement('h3'),p=document.createElement('p');h.textContent=term;p.textContent=definition;a.append(h,p);$('terms').append(a);}if(!$('terms').children.length)$('terms').textContent='No matching terms. Try “balance” or “revert”.';}
function guide(query=''){$('search').value=query;terms();$('glossary').showModal();$('search').focus();}
$('glossary-open').addEventListener('click',()=>guide());$('invariant-help').addEventListener('click',()=>guide('invariant'));$('glossary-close').addEventListener('click',()=>$('glossary').close());$('search').addEventListener('input',terms);
$('sound').addEventListener('click',()=>{sound=!sound;$('sound').textContent=sound?'Sound on':'Sound off';$('sound').setAttribute('aria-pressed',String(sound));tone();});
function motion(){document.body.classList.toggle('reduce-motion',reduced);$('motion').setAttribute('aria-pressed',String(reduced));$('motion').textContent=reduced?'Motion reduced':'Reduce motion';}
$('motion').addEventListener('click',()=>{reduced=!reduced;motion();});motion();
$('export').addEventListener('click',()=>{const url=URL.createObjectURL(new Blob([JSON.stringify({schemaVersion:1,kind:'learner-reported-case-notes',solidityExecution:'unverified',attempts:progress},null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='ledger-lock-case-notes.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
selectCase(active);
