'use strict';
(function(root){
 const goals={mobility:'가볍게 몸 풀기',first_pullup:'첫 턱걸이 도전',strength:'등·상체 근력 키우기'};
 function plan(profile){
  const p=profile||{},base={goal:'hang',exercise_id:'hang',capability:'hang',assistance:'none',grip:'overhand',band_note:'',target:'10',planned_sets:2,rest_seconds:60,plan_origin:'custom',plan_level:null};
  if(p.goal==='mobility'||p.experience==='new'||p.age_group==='65_plus')return {...base,target:'5',assistance:'feet'};
  if(p.experience==='pullup')return {...base,goal:p.goal==='strength'?'more_pullups':'first_pullup',exercise_id:'pullup',capability:'pullup',target:p.goal==='strength'?'3':'1',planned_sets:p.goal==='strength'?3:2,rest_seconds:120};
  if(p.experience==='hang')return {...base,goal:'first_pullup',exercise_id:'scapular_pull',capability:'scapular_pull',target:'5'};
  return base;
 }
 function route(hash){const parts=String(hash||'').replace(/^#\/?/,'').split('/');if(['today','history','gear','program','profile','exercises','workout','complete','setup'].includes(parts[0]))return {page:parts[0],item:parts[0]==='exercises'&&/^[a-z_]+$/.test(parts[1]||'')?parts[1]:null};return {page:'today',item:null};}
 // Timer deadline is based on elapsed active time; reaching a target never saves a performed set.
 function target(timer,seconds,now=Date.now()){
  const n=Number(seconds);if(!timer||timer.kind!=='hang'||!timer.running||timer.target_reached||!Number.isInteger(n)||n<1||n>3600)return null;
  const left=n*1000-(timer.elapsed||0)-Math.max(0,now-timer.started_at);
  return {remaining:Math.max(0,left),reached:left<=0,timer:left<=0?{...timer,running:false,elapsed:n*1000,target_reached:true}:timer};
 }
 const api={goals,plan,route,target};if(typeof module!=='undefined'&&module.exports)module.exports=api;root.FitableRoutine=api;
})(typeof globalThis!=='undefined'?globalThis:this);
