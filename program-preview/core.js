'use strict';
(function(root){
 const exercises={
  hang:{id:'hang',name:'매달리기',term:'',summary:'팔을 펴고 철봉을 잡은 채 버텨요.',level:'처음이라면 여기서 시작',unit:'초',max:3600,muscles:['back','arms'],guide:['바 아래 바닥에 서서 두 손으로 철봉을 잡아요. 점프해서 잡지 않아요.','무릎을 굽혀 발을 바닥에서 띄우고, 팔을 편 채 몸을 흔들지 않고 버텨요. 어깨 힘을 완전히 풀지 않아요.','힘들어지기 전에 발을 바닥에 천천히 내려요.']},
  scapular_pull:{id:'scapular_pull',name:'어깨 내리기',term:'견갑골 당기기',summary:'팔은 그대로, 어깨만 귀에서 멀어지게 해요.',level:'매달리기가 편안하다면',unit:'회',max:500,muscles:['back','shoulders'],guide:['바닥에 서서 철봉을 잡고, 무릎을 굽혀 발을 띄운 뒤 팔꿈치를 편 채 매달려요.','팔을 굽히지 않고 어깨만 아래로 내려요. 몸이 조금 올라가요.','어깨를 천천히 처음 위치로 돌려요. 이 움직임이 1회예요. 끝나면 발을 바닥에 천천히 내려요.']},
  pullup:{id:'pullup',name:'턱걸이',term:'풀업',summary:'몸을 천천히 올렸다가 내려요.',level:'이미 턱걸이를 할 수 있다면',unit:'회',max:500,muscles:['back','arms'],guide:['철봉을 잡고 무릎을 굽혀 발을 띄운 뒤, 팔을 편 자세로 시작해요.','팔꿈치를 아래로 당기며 몸을 올려요. 목만 뻗지 않아요.','천천히 내려와 팔을 펴요. 올라갔다 내려오면 1회예요.']},
  negative_pullup:{id:'negative_pullup',name:'천천히 내려오기',term:'네거티브 턱걸이',summary:'바닥에서 다리로 밀며 올라간 뒤, 천천히 내려와요.',level:'발 디딤 턱걸이가 편해졌다면',unit:'회',max:500,muscles:['back','arms'],guide:['바닥에서 다리로 밀며 팔로 당겨, 올라갈 수 있는 가장 높은 곳까지 올라가요. 점프하지 않아요.','거기서 3~5초 동안 팔을 천천히 펴며 내려와요.','팔이 다 펴지면 발을 바닥에 천천히 내려요. 툭 떨어지지 않아요. 이 움직임이 1회예요.']},
  band_pullup:{id:'band_pullup',name:'밴드 도움 받아 턱걸이',term:'밴드 보조 풀업',summary:'호환되는 밴드의 도움으로 몸을 올려요.',level:'제품·밴드의 호환 확인 후',unit:'회',max:500,muscles:['back','arms'],guide:['철봉과 밴드 설명서에서 함께 써도 되는지 먼저 확인해요.','설명서에 맞게 준비한 뒤 반동 없이 몸을 올려요.','천천히 내려와요. 밴드를 갑자기 놓지 않아요.']}
 };
 const grips={
  overhand:{id:'overhand',name:'풀업 그립',term:'오버핸드',direction:'손등이 나를 향하게',setup:'손등이 얼굴 쪽을 향하게 잡아요. 엄지까지 감싸고 손목을 곧게 유지해 주세요.',pull:'팔꿈치를 몸 옆으로 내리며 올라가요. 몸을 흔들거나 목만 뻗지 않고 천천히 내려와요.'},
  underhand:{id:'underhand',name:'친업 그립',term:'언더핸드',direction:'손바닥이 나를 향하게',setup:'손바닥이 얼굴 쪽을 향하게 잡아요. 엄지까지 감싸고 손목을 뒤로 꺾지 않아요.',pull:'팔꿈치를 몸 앞쪽에 두고 아래로 당기며 올라가요. 반동 없이 천천히 내려와요.'}
 };
 function gripGuide(id,grip,assistance='none'){
  const g=grips[grip];if(!g||!exercises[id])return null;
  const pulling=['pullup','negative_pullup','band_pullup'].includes(id);
  const movement=id==='negative_pullup'?'올라갈 수 있는 범위에서 시작해 팔을 천천히 펴며 내려와요.':pulling?g.pull:id==='scapular_pull'?'팔꿈치를 편 채 어깨를 귀에서 멀어지게 내렸다가 돌아와요.':'팔을 편 채 몸을 흔들지 않고 버텨요. 어깨 힘을 완전히 풀지 않아요.';
  return {...g,movement,width:'제품 그립 안에서 양손을 대칭으로 잡아 주세요. 기록을 비교할 때는 손 방향과 간격을 같게 맞춰 주세요.',finish:assistance==='feet'?'발끝은 바닥에 댄 채, 발이 떨어지지 않는 범위에서 움직여요.':'끝낼 때는 발을 바닥에 천천히 내려요.',note:'손목이나 어깨가 불편하면 멈춰 주세요. 손 간격을 억지로 넓히지 않아요.'};
 }
 const goals={hang:{name:'철봉에 익숙해지기',note:'짧게 매달리며 시작해요.',starter:'hang'},first_pullup:{name:'첫 턱걸이 해 보기',note:'지금 가능한 동작부터 연습해요.',starter:'hang'},more_pullups:{name:'턱걸이 더 해 보기',note:'같은 방법으로 한 기록을 비교해요.',starter:'pullup'}};
 const recommendations={
  hang:{target:10,planned_sets:2,rest_seconds:60,goal:'hang',note:'10초가 어려우면 더 짧게 해도 괜찮아요.'},
  scapular_pull:{target:5,planned_sets:2,rest_seconds:60,goal:'first_pullup',note:'매달리기가 편안할 때 골라요. 팔은 계속 펴 두세요.'},
  pullup:{target:1,planned_sets:2,rest_seconds:120,goal:'more_pullups',note:'이미 턱걸이를 할 수 있는 분의 시작 예시예요. 어렵다면 매달리기를 골라요.'}
 };
 function withRecommendation(current,id){const p=recommendations[id];if(!p)return {...current,exercise_id:id,capability:id,assistance:id==='band_pullup'?'band':'none',band_note:id==='band_pullup'?(current.band_note||''):'',target:'',planned_sets:1,rest_seconds:120,plan_origin:'custom',plan_level:null,plan_version:3};return {...current,...p,exercise_id:id,capability:id,assistance:'none',band_note:'',target:String(p.target),plan_origin:'recommended',plan_level:null,plan_version:3};}
 function restoredPlanHint(workout,cached){const empty={target:'',plan_origin:'custom'};if(!cached||!(cached.plan_workout_id===workout.id||cached.active_id===workout.id))return empty;const value=Number(cached.target);if(!Number.isInteger(value)||value<1||value>exercises[workout.exercise_id].max)return empty;return {target:String(value),plan_origin:cached.plan_origin==='recommended'?'recommended':'custom'};}
 const dateKey=(date=new Date())=>`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
 function shiftDate(key,n){const d=new Date(key+'T12:00:00');d.setDate(d.getDate()+n);return dateKey(d);}
 const condition=w=>[w.exercise_id,w.grip,w.assistance,w.assistance==='band'?String(w.band_note||'').trim():''].join('|');
 const validCondition=(exerciseId,assistance)=>Boolean(exercises[exerciseId]&&['none','feet','band'].includes(assistance)&&(exerciseId==='band_pullup'?assistance==='band':assistance!=='band'));
 const setRecord=(previous,next,stamp)=>({...next,created_at:previous?.created_at||stamp,updated_at:stamp});
 function commitLocalChange(current,mutate,write){const draft=JSON.parse(JSON.stringify(current));const value=mutate(draft);write(JSON.stringify(draft));return {state:draft,value};}
 const demoChanged=(stored,known)=>(stored??null)!==(known??null);
 const timerMatches=(timer,workoutId,position)=>Boolean(timer&&timer.workout_id===workoutId&&timer.position===position);
 const positive=s=>s.status==='completed'&&Number.isInteger(s.value)&&s.value>0;
 const conditionLabel=w=>`${w.grip==='underhand'?'손바닥이 나를 향하게':'손등이 나를 향하게'} · ${w.assistance==='band'?`밴드 ${w.band_note||''}`:w.assistance==='feet'?'발을 딛고 도움 받기':'도움 없이 하기'}`;
 function completedSets(workouts){return workouts.flatMap(w=>(w.sets||[]).filter(positive).map(s=>({...s,workout:w,performed_on:w.performed_on})));}
 // 끝낸 운동(완료·중간 종료)의 양수 세트 — 운동한 날·최근 7일 운동 부위가 같은 기준을 쓴다.
 const finishedSets=workouts=>completedSets((Array.isArray(workouts)?workouts:[]).filter(w=>w&&w.status!=='active'));
 // 운동한 날은 끝낸 운동(완료·중간 종료)의 양수 세트만 센다 — 1/2/4주 집계(habit-progress.js)와 같은 기준.
 function metrics(workouts,legacy=[],now=dateKey()){
  const sets=finishedSets(workouts),dates=new Set([...sets.map(s=>s.performed_on),...legacy.filter(r=>r.value>0).map(r=>r.performed_on)]),weekStart=shiftDate(now,-((new Date(now+'T12:00:00').getDay()+6)%7));let cursor=dates.has(now)?now:shiftDate(now,-1),streak=0;while(dates.has(cursor)){streak++;cursor=shiftDate(cursor,-1);}
  const recentStart=shiftDate(now,-6);
  return {sets,dates:[...dates],total_days:dates.size,week_days:[...dates].filter(d=>d>=weekStart&&d<=now).length,recent_days:[...dates].filter(d=>d>=recentStart&&d<=now).length,streak};
 }
 function groups(workouts){const map=new Map();workouts.slice().reverse().forEach((w,sequence)=>(w.sets||[]).filter(positive).forEach(s=>{const key=condition(w);if(!map.has(key))map.set(key,{key,workout:w,values:[]});map.get(key).values.push({...s,date:w.performed_on,created_at:s.created_at||w.created_at,session_created_at:w.created_at,sequence});}));return [...map.values()].map(g=>{g.values.sort((a,b)=>a.date.localeCompare(b.date)||String(a.created_at).localeCompare(String(b.created_at))||String(a.session_created_at).localeCompare(String(b.session_created_at))||a.sequence-b.sequence||a.position-b.position);return {...g,first:g.values[0].value,latest:g.values[g.values.length-1].value,best:Math.max(...g.values.map(s=>s.value))};});}
 function timerValue(timer,now=Date.now()){if(!timer)return 0;return timer.kind==='rest'?Math.max(0,Math.ceil((timer.running?timer.deadline-now:timer.remaining)/1000)):Math.floor(((timer.elapsed||0)+(timer.running?Math.max(0,now-timer.started_at):0))/1000);}
 function pauseTimer(timer,now=Date.now()){if(!timer)return null;if(timer.kind==='rest')return {...timer,running:false,remaining:timer.running?Math.max(0,timer.deadline-now):(timer.remaining||0)};return {...timer,running:false,elapsed:(timer.elapsed||0)+(timer.running?Math.max(0,now-timer.started_at):0)};}
 function sanitize(saved){if(!saved||typeof saved!=='object')return {workouts:[],records:[],registrations:[],challenge:null};const validDate=d=>typeof d==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(d)&&d>='2000-01-01'&&d<=dateKey()&&dateKey(new Date(d+'T12:00:00'))===d;return {workouts:Array.isArray(saved.workouts)?saved.workouts.filter(w=>w&&exercises[w.exercise_id]&&goals[w.goal]&&validDate(w.performed_on)&&Number.isInteger(w.planned_sets)&&w.planned_sets>=1&&w.planned_sets<=10&&['none','feet','band'].includes(w.assistance)&&['overhand','underhand'].includes(w.grip)&&['active','completed','stopped'].includes(w.status)).map(w=>({...w,sets:(Array.isArray(w.sets)?w.sets:[]).filter(s=>Number.isInteger(s.value)&&s.value>=0&&s.value<=exercises[w.exercise_id].max&&Number.isInteger(s.position)&&s.position>=1&&s.position<=10&&['completed','attempted','skipped'].includes(s.status))})):[],records:Array.isArray(saved.records)?saved.records.filter(r=>r&&['hang','pullup','step','squat'].includes(r.exercise_id)&&Number.isInteger(r.value)&&r.value>0&&validDate(r.performed_on)):[],registrations:Array.isArray(saved.registrations)?saved.registrations.filter(r=>r&&['OPB01','STM02'].includes(r.product_id)).map(r=>({...r,order_no:'DEMO-EXAMPLE',channel:'demo'})):[],habitConfig:saved.habitConfig&&typeof saved.habitConfig==='object'?{started_on:validDate(saved.habitConfig.started_on)?saved.habitConfig.started_on:null,selected_weekdays:Array.isArray(saved.habitConfig.selected_weekdays)?[...new Set(saved.habitConfig.selected_weekdays.filter(n=>Number.isInteger(n)&&n>=0&&n<=6))].slice(0,2):[],pending_weekdays:Array.isArray(saved.habitConfig.pending_weekdays)?[...new Set(saved.habitConfig.pending_weekdays.filter(n=>Number.isInteger(n)&&n>=0&&n<=6))].slice(0,2):null,pending_effective_on:typeof saved.habitConfig.pending_effective_on==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(saved.habitConfig.pending_effective_on)&&dateKey(new Date(saved.habitConfig.pending_effective_on+'T12:00:00'))===saved.habitConfig.pending_effective_on?saved.habitConfig.pending_effective_on:null,revision:Number.isInteger(saved.habitConfig.revision)?saved.habitConfig.revision:0}:{},challenge:saved.challenge&&validDate(saved.challenge.started_at?.slice(0,10))?saved.challenge:null};}
 // 단계 프로그램: 단계 정의(program-levels.js)를 인자로 받는 순수 함수. 기록은 읽기만 하고 고치지 않는다.
 const levelById=(levels,id)=>levels.find(l=>l.id===id)||null;
 const levelFor=(levels,exerciseId,assistance)=>levels.find(l=>l.exercise_id===exerciseId&&(assistance===undefined||l.assistance===assistance))||null;
 function levelStep(levels,id,direction){const i=levels.findIndex(l=>l.id===id);return i<0?null:levels[i+direction]||null;}
 function withLevelPlan(current,level){return {...current,exercise_id:level.exercise_id,capability:level.exercise_id,assistance:level.assistance,band_note:'',target:String(level.plan.target),planned_sets:level.plan.planned_sets,rest_seconds:level.plan.rest_seconds,goal:level.goal,plan_origin:'recommended',plan_level:level.id,plan_version:3};}
 const planMatchesLevel=(u,level)=>Boolean(u&&level&&u.exercise_id===level.exercise_id&&u.assistance===level.assistance&&String(u.target)===String(level.plan.target)&&Number(u.planned_sets)===level.plan.planned_sets&&Number(u.rest_seconds)===level.plan.rest_seconds);
 function levelProgress(level,workouts,since){
  const needed=level.advance?level.advance.sessions:0,sinceMs=since?Date.parse(since):NaN,empty={needed,streak:0,ready:false,latest:null,hold:null,suggest_down:false,sessions:0};
  const pool=(Array.isArray(workouts)?workouts:[]).filter(w=>w&&w.status!=='active'&&w.exercise_id===level.exercise_id&&w.assistance===level.assistance&&(Number.isNaN(sinceMs)||Date.parse(w.created_at)>=sinceMs)).slice().sort((a,b)=>String(b.performed_on).localeCompare(String(a.performed_on))||(Date.parse(b.created_at)||0)-(Date.parse(a.created_at)||0));
  if(!pool.length)return empty;
  const key=condition(pool[0]),same=pool.filter(w=>condition(w)===key);
  const judged=same.map(w=>{const values=(w.sets||[]).filter(positive).slice().sort((a,b)=>a.position-b.position).map(s=>s.value),met=values.filter(v=>v>=level.plan.target).length,reached=met>=level.plan.planned_sets,effort=w.effort||null,discomfort=Boolean(w.discomfort);return {id:w.id,date:w.performed_on,values,met,reached,effort,discomfort,counts:reached&&effort!=='hard'&&!discomfort};});
  let streak=0;for(const j of judged){if(!j.counts)break;streak++;}
  const latest=judged[0],hold=latest.discomfort?'discomfort':latest.reached&&latest.effort==='hard'?'hard':null;
  const suggest_down=latest.discomfort||(judged.length>=2&&judged.slice(0,2).every(j=>j.effort==='hard'&&!j.reached));
  return {needed,streak,ready:Boolean(level.advance)&&streak>=needed,latest:{...latest,label:conditionLabel(same[0])},hold,suggest_down,sessions:judged.length};
 }
 // 그날이 «운동한 날»인지: 끝낸 운동 중 양수 세트가 있으면 참(habit-progress.js participationDays 와 같은 기준). exceptId 운동은 빼고 본다.
 const countedDay=(workouts,day,exceptId)=>(Array.isArray(workouts)?workouts:[]).some(x=>x&&x.id!==exceptId&&x.status!=='active'&&x.performed_on===day&&(x.sets||[]).some(positive));
 const prepareCheck=(levels,exerciseId,assistance)=>levels.find(l=>l.exercise_id===exerciseId&&l.assistance===assistance&&l.prepare_check)?.prepare_check||'';
 const addonFor=(addons,levels,exerciseId,assistance)=>{const l=assistance===undefined?null:levelFor(levels,exerciseId,assistance);return l?Object.values(addons||{}).find(a=>a.level_ids.includes(l.id))||null:null;};
const api={grips,gripGuide,demoChanged,levelById,levelFor,addonFor,prepareCheck,countedDay,levelStep,withLevelPlan,planMatchesLevel,levelProgress,restoredPlanHint,recommendations,withRecommendation,setRecord,validCondition,commitLocalChange,timerMatches,exercises,goals,dateKey,shiftDate,condition,conditionLabel,positive,completedSets,finishedSets,metrics,groups,timerValue,pauseTimer,sanitize};if(typeof module!=='undefined'&&module.exports)module.exports=api;root.FitableCore=api;
})(typeof globalThis!=='undefined'?globalThis:this);
