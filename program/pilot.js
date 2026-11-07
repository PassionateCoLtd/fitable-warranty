'use strict';
/* First-party, allowlisted measurements. No text inputs, page URLs, IPs or referrers. */
(function(root){
 let state={enabled:false,authenticated:false,enrolled:false,scope:null},queue=[],busy=false,context=()=>({}),lastScreen='';
 const key=()=> 'fitable.pilot.queue.'+state.scope;
 function persist(){try{if(state.scope)localStorage.setItem(key(),JSON.stringify({saved_at:Date.now(),events:queue.slice(-200)}));}catch{}}
 function clear(){queue=[];persist();}
 async function timedFetch(url,options={}){const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),4000);try{return await fetch(url,{...options,signal:controller.signal});}finally{clearTimeout(timer);}}
 async function init(){
  if(location.hostname.endsWith('.github.io')||location.protocol==='file:')return state;
  try{const r=await timedFetch('/api/pilot/session',{credentials:'same-origin',cache:'no-store'});if(!r.ok)return state;const previous=state.scope;state=await r.json();if(previous&&previous!==state.scope){try{localStorage.removeItem('fitable.pilot.queue.'+previous);}catch{}queue=[];}
   if(state.enabled){try{const saved=JSON.parse(localStorage.getItem(key())||'null');queue=saved&&Date.now()-saved.saved_at<90*86400000&&Array.isArray(saved.events)?saved.events.filter(x=>x&&typeof x.id==='string').slice(-200):[];}catch{queue=[];}track('page_view',{screen:'entry'});}else clear();
  }catch{}return state;
 }
 async function enroll(enabled){const r=await timedFetch('/api/pilot/enroll',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({enabled,scope:state.scope})});if(!r.ok)throw new Error('파일럿 참여를 저장하지 못했어요 — 새로고침 후 다시 시작해 주세요');await init();return state;}
 async function consent(enabled){
  const r=await timedFetch('/api/pilot/consent',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({enabled,scope:state.scope})});
  if(!r.ok)throw new Error('참여 분석 설정을 저장하지 못했어요');
  clear();state.enabled=enabled;lastScreen='';if(enabled){track('consent',{});track('page_view',{screen:'entry'});}return state;
 }
 function track(name,properties={}){if(!state.enabled||context().mode==='demo')return;queue.push({id:crypto.randomUUID(),name,properties:{...context(),...properties}});if(queue.length>200)queue.shift();persist();flush();}
 async function flush(){if(busy||!state.enabled||!queue.length)return;busy=true;const batch=queue.slice(0,20);try{const r=await timedFetch('/api/pilot/events',{method:'POST',credentials:'same-origin',keepalive:true,headers:{'Content-Type':'application/json'},body:JSON.stringify({events:batch,scope:state.scope})});if(r.ok){const body=await r.json(),ids=new Set(body.accepted);queue=queue.filter(e=>!ids.has(e.id));persist();}else if(r.status===401||r.status===403){state.enabled=false;clear();}else if(r.status===409){clear();state.enabled=false;await init();}else if(r.status===400){const bad=new Set(batch.map(x=>x.id));queue=queue.filter(e=>!bad.has(e.id));persist();}}catch{}finally{busy=false;}}
 function screen(value){if(value!==lastScreen){lastScreen=value;track('screen_view',{screen:value});}}
 const actions=new Set(['prepare-start','measure-toggle','edit-actual','rest-next','rest-skip','stop','finish','pick-exercise','pick-product','quick-start','change-grip','show-setup','hide-setup','go-program','view-history','resume','leave-session','attempt','skip','rest-add','logout','delete-account','ai-copy','ai-csv','ai-txt','habit-schedule','habit-details','level-up','level-down','level-prepare','history-filter','value-step','preferences','sync-purchases','sound-test','prepare-back']);
 document.addEventListener('click',e=>{if(e.target.closest('#rv-root')||document.getElementById('rv-root')?.dataset.mode)return;const el=e.target.closest('button,a,summary');if(!el)return;let action=actions.has(el.dataset.action)?el.dataset.action:el.dataset.tab||'other';if(el.dataset.pilotStart)action='start-'+el.dataset.pilotStart;if(el.id==='account-button')action='account';if(el.tagName==='SUMMARY')action='guide';if(el.getAttribute('href')==='/api/auth/start')action='member-login';if(el.type==='submit')action=el.closest('#preferences-form')?'save-preferences':'save';if(el.dataset.pickItem||el.dataset.chooseExercise||el.dataset.selectExercise)action='choose-exercise';if(el.dataset.levelChoose)action='choose-level';if(el.dataset.editSet||el.dataset.position)action='edit-set';if(el.dataset.undoSet)action='delete-set';if(el.dataset.deleteWorkout)action='delete-workout';if(el.hasAttribute('data-pilot-settings'))action='privacy-settings';if(el.hasAttribute('data-pilot-toggle'))action='privacy-toggle';if(el.dataset.guideStep!==undefined)action='guide';if(el.dataset.filter)action='history-filter';if(el.dataset.valueStep)action='value-step';if(el.dataset.action==='pain')action='stop';if(el.dataset.action==='export-demo'||el.getAttribute('href')==='/api/export')action='export';track('click',{action});},true);
 document.addEventListener('change',e=>{if(e.target.matches('select[name=grip]')&&['overhand','underhand'].includes(e.target.value))track('click',{action:'change-grip',grip:e.target.value});});
 addEventListener('online',flush);document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')flush();});setInterval(flush,5000);
 root.FitablePilot={init,enroll,consent,track,screen,flush,state:()=>state,context:fn=>{context=fn;}};
})(globalThis);
