'use strict';
/* Participation badges only. Dates are existing performed_on calendar dates;
 * the caller supplies today's Asia/Seoul date. No rewards or exercise progression. */
(function(root){
 const POLICY_VERSION='habit-124-v1', TARGET_DAYS=2, DAY=86400000;
 function dayNumber(value){
  if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value)||value<'2000-01-01')return null;
  const n=Date.parse(value+'T00:00:00Z');
  return Number.isFinite(n)&&new Date(n).toISOString().slice(0,10)===value?n/DAY:null;
 }
 const iso=n=>new Date(n*DAY).toISOString().slice(0,10);
 function participationDays(workouts,todayISO){
  const today=dayNumber(todayISO);if(today===null)throw new Error('invalid_today');
  const seen=new Set(),days=new Set();
  for(const w of Array.isArray(workouts)?workouts:[]){
   if(!w||typeof w!=='object')continue;
   if(w.id){if(seen.has(w.id))continue;seen.add(w.id);}
   const d=dayNumber(w.performed_on);
   if(d===null||d>today||!['completed','stopped'].includes(w.status))continue;
   if((Array.isArray(w.sets)?w.sets:[]).some(s=>s&&s.status==='completed'&&Number.isInteger(s.value)&&s.value>0))days.add(w.performed_on);
  }
  return [...days].sort();
 }
 function calculate(workouts,config={},todayISO){
  const today=dayNumber(todayISO);if(today===null)throw new Error('invalid_today');
  const days=participationDays(workouts,todayISO),fixed=dayNumber(config?.started_on);
  const start=fixed!==null?fixed:(days.length?dayNumber(days[0]):null);
  const started=start!==null&&start<=today;
  const count=started?Math.floor((today-start)/7)+1:0;
  const buckets=new Map();
  if(started)for(const d of days){const index=Math.floor((dayNumber(d)-start)/7);if(index>=0)buckets.set(index,(buckets.get(index)||0)+1);}
  let completed=0;const weeks=[];
  for(let i=0;i<count;i++){
   const n=buckets.get(i)||0,closed=i<count-1,achieved=closed&&n>=TARGET_DAYS;
   if(achieved)completed++;
   weeks.push({week:i+1,start:iso(start+i*7),end:iso(start+i*7+6),days:n,closed,achieved});
  }
  const current=count?weeks[count-1]:null;
  return {policy_version:POLICY_VERSION,started_on:started?iso(start):null,current_week:count,
   completed_weeks:completed,current_days:current?current.days:0,target_days:TARGET_DAYS,
   current_start:current?current.start:null,current_end:current?current.end:null,
   next_week_on:current?iso(start+count*7):null,week_goal_met:Boolean(current&&current.days>=TARGET_DAYS),
   milestones:[1,2,4].map(weeks=>({weeks,achieved:completed>=weeks})),
   next_milestone:[1,2,4].find(n=>completed<n)||null,participation_days:days.filter(d=>started&&dayNumber(d)>=start),weeks};
 }
 const api={POLICY_VERSION,TARGET_DAYS,calculate,participationDays};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
 root.FitableHabit=api;
})(typeof globalThis!=='undefined'?globalThis:this);
