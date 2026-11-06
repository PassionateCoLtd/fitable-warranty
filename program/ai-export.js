'use strict';
/* 내 기록을 AI·엑셀에 넣는 글/CSV. 운동한 날은 «내 기록» 탭과 같은 FitableCore.metrics(finishedSets)·countedDay 기준이라 진행 중 운동은 빠진다.
   이름·연락처·주문번호·구매처는 넣지 않는다(기구 이름만). */
(function(root){
 const C=typeof module!=='undefined'&&module.exports?require('./core.js'):root.FitableCore;
 const FEEL={easy:'쉬움',right:'적당',hard:'어려움'},WD=['일','월','화','수','목','금','토'],LEGACY={step:['스텝 운동','분'],squat:['맨몸 스쿼트','회']};
 const PROMPTS=['이 기록을 보고 다음 주 운동 계획을 짜 줘.','기록이 늘고 있는지 보고, 다음 단계로 올라가도 될지 알려 줘.','첫 턱걸이를 하려면 무엇을 더 연습하면 좋을지 알려 줘.'];
 const day=d=>`${d}(${WD[new Date(d+'T12:00:00').getDay()]})`,short=d=>d?d.slice(5).replace('-','/'):'';
 const exName=id=>{const e=C.exercises[id];return e?e.name+(e.term?`(${e.term})`:''):(LEGACY[id]||[id])[0];},unit=id=>C.exercises[id]?.unit||(LEGACY[id]||[,'회'])[1];
 const setLabel=(s,u)=>s.status==='completed'?s.value+u:s.status==='attempted'?'시도 0':'건너뜀';
 const finished=workouts=>(Array.isArray(workouts)?workouts:[]).filter(w=>w&&w.status!=='active').slice().sort((a,b)=>a.performed_on.localeCompare(b.performed_on)||String(a.created_at).localeCompare(String(b.created_at)));
 // 엑셀이 =·+·-·@ 로 시작하는 칸을 수식으로 읽지 않게 앞에 ' 를 붙인다(밴드 메모처럼 직접 적은 칸).
 const cell=v=>{let s=String(v??'');if(/^[=+\-@\t\r]/.test(s))s="'"+s;return /[",\r\n]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s;};
 function levelLine(level,levels){const list=Array.isArray(levels)?levels:[],i=list.findIndex(l=>l.id===level?.id);if(i<0)return '';const l=list[i],u=unit(l.exercise_id);
  return `현재 단계 ${i+1}/${list.length} ${l.name} · 목표 ${l.plan.target}${u}씩 ${l.plan.planned_sets}세트${level.chosen?(level.since?` · ${level.since}부터`:''):' · 아직 고르지 않음'}`;}
 function habitLines(h,config){if(!h)return [];if(!h.started_on)return ['주 2일 목표 · 첫 운동을 마치면 시작돼요'];
  const ms=(h.milestones||[]).map(m=>`${m.weeks}주 ${m.achieved?'달성':h.next_milestone===m.weeks?'진행 중':'미달성'}`).join(' · ');
  const out=[`주 ${h.target_days}일 목표 · 누적 ${h.completed_weeks}주 달성 (${ms})`,`이번 주 ${short(h.current_start)}~${short(h.current_end)} ${h.current_days}/${h.target_days}일`];
  const wd=(config?.selected_weekdays||[]).map(d=>WD[d]).filter(Boolean);if(wd.length)out.push('운동 요일 '+wd.join(' · '));return out;}
 function build(input={}){
  const workouts=Array.isArray(input.workouts)?input.workouts:[],records=(Array.isArray(input.records)?input.records:[]).filter(r=>r&&r.value>0).slice().sort((a,b)=>a.performed_on.localeCompare(b.performed_on));
  const list=finished(workouts),today=input.today||C.dateKey(),days=C.metrics(workouts,records,today).dates.slice().sort(),active=workouts.some(w=>w&&w.status==='active');
  const all=[...list.map(w=>w.performed_on),...records.map(r=>r.performed_on)].sort();
  const head=[`핏에이블 루틴 운동 기록 · ${input.product||'와이드 풀업바'}`,`내려받은 날 ${today}`,all.length?`기간 ${all[0]} ~ ${all[all.length-1]} · 운동한 날 ${days.length}일`:'아직 끝낸 운동이 없어요'];
  const lv=levelLine(input.level,input.levels);if(lv)head.push(lv);head.push(...habitLines(input.habit,input.habitConfig));
  const body=list.map(w=>{const u=unit(w.exercise_id),sets=(w.sets||[]).slice().sort((a,b)=>a.position-b.position),pos=sets.filter(C.positive),sum=pos.reduce((a,s)=>a+s.value,0);
   const tail=[w.status==='stopped'?'중간 종료':'운동 종료',w.effort&&FEEL[w.effort]?'느낌 '+FEEL[w.effort]:'',w.discomfort===true?'불편함 있었음':w.discomfort===false?'불편함 없음':'',C.countedDay(workouts,w.performed_on)?'':'운동한 날에 들어가지 않음'].filter(Boolean).join(' · ');
   return `${day(w.performed_on)} ${exName(w.exercise_id)} · ${C.conditionLabel(w).trim()}\n  ${sets.length?sets.map(s=>s.position+'세트 '+setLabel(s,u)).join(' · '):'저장한 세트 없음'}${pos.length?` · 완료 ${pos.length}세트 합계 ${sum}${u}`:''}\n  ${tail}`;});
  const legacy=records.map(r=>`${day(r.performed_on)} ${exName(r.exercise_id)} ${r.value}${unit(r.exercise_id)}`);
  const text=[...head,'',...(body.length?['날짜별 기록',...body]:[]),...(legacy.length?['','예전 간편 기록(세트 구분 없음)',...legacy]:[]),'',
   `이름·연락처·주문 정보는 넣지 않았어요.${active?' 지금 하고 있는 운동은 끝낸 뒤에 들어가요.':''} 아프거나 불편하면 운동을 멈추고 전문가와 상의해 주세요.`,'',
   '질문 예시 (물어볼 것만 남기고 보내세요)',...PROMPTS.map(p=>'- '+p)].join('\n');
  const rows=[['날짜','요일','운동','손 방향·도움','세트','세트 상태','기록','단위','운동 상태','느낌','불편함','운동한 날로 셈']];
  list.forEach(w=>{const u=unit(w.exercise_id),base=[w.performed_on,WD[new Date(w.performed_on+'T12:00:00').getDay()],exName(w.exercise_id),C.conditionLabel(w).trim()],
   after=[w.status==='stopped'?'중간 종료':'운동 종료',FEEL[w.effort]||'',w.discomfort===true?'있음':w.discomfort===false?'없음':'',C.countedDay(workouts,w.performed_on)?'예':'아니요'],sets=(w.sets||[]).slice().sort((a,b)=>a.position-b.position);
   if(!sets.length)rows.push([...base,'','세트 없음','',u,...after]);
   sets.forEach(s=>rows.push([...base,s.position,{completed:'완료',attempted:'시도',skipped:'건너뜀'}[s.status]||s.status,s.status==='completed'?s.value:0,u,...after]));});
  records.forEach(r=>rows.push([r.performed_on,WD[new Date(r.performed_on+'T12:00:00').getDay()],exName(r.exercise_id),'','','예전 간편 기록',r.value,unit(r.exercise_id),'','','','예']));
  // BOM + CRLF: 한글 엑셀이 UTF-8 로 바로 연다.
  const csv='﻿'+rows.map(r=>r.map(cell).join(',')).join('\r\n')+'\r\n';
  return {text,csv,prompts:PROMPTS.slice(),days,active,has_data:Boolean(list.length||records.length),filename:'fitable-routine-'+today.replace(/-/g,'')};
 }
 const api={build,prompts:PROMPTS};if(typeof module!=='undefined'&&module.exports)module.exports=api;root.FitableExport=api;
})(typeof globalThis!=='undefined'?globalThis:this);
