'use strict';
/* View state only. Workout time/records remain owned by FitableCore and the API. */
(function(root){
 const C=typeof module!=='undefined'&&module.exports?require('./core.js'):root.FitableCore;
 function options(value={}){return {countdown_enabled:value.countdown_enabled!==false,sound_enabled:value.sound_enabled===true};}
 function validCountdown(value,workout){return Boolean(value&&workout?.status==='active'&&value.workout_id===workout.id&&Number.isInteger(value.position)&&value.position>=1&&value.position<=workout.planned_sets&&Number.isFinite(value.deadline));}
 function begin(workout,position,enabled,now=Date.now()){
  return enabled?{countdown:{workout_id:workout.id,position,deadline:now+3000},timer:null}:{countdown:null,timer:{workout_id:workout.id,position,kind:'hang',running:true,started_at:now,elapsed:0}};
 }
 function settle(countdown,workout,timer,now=Date.now()){
  if(!validCountdown(countdown,workout))return {countdown:null,timer,started:false};
  if(timer&&!C.timerMatches(timer,workout.id,countdown.position))return {countdown:null,timer,started:false};
  if(now<countdown.deadline)return {countdown,timer,started:false};
  return {countdown:null,timer:{workout_id:workout.id,position:countdown.position,kind:'hang',running:true,started_at:countdown.deadline,elapsed:0},started:true};
 }
 function actualValue(workout,position,draft,timer){
  if(draft!==undefined&&draft!==null)return String(draft);
  const saved=workout.sets.find(s=>s.position===position);if(saved)return String(saved.value);
  if(workout.exercise_id==='hang'&&C.timerMatches(timer,workout.id,position)&&timer.kind==='hang')return String(C.timerValue(timer));
  return '';
 }
 function total(workout){const sets=(workout?.sets||[]).filter(C.positive);return {sets,total:sets.reduce((n,s)=>n+s.value,0),participated:sets.length>0};}
 const api={options,validCountdown,begin,settle,actualValue,total};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;root.FitableSessionFlow=api;
})(typeof globalThis!=='undefined'?globalThis:this);
