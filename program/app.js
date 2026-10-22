'use strict';
(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const STORE = 'fitable.movement.demo.v1';
  const MALL = 'https://fitablekorea.com';
  const labels = {seconds:'초',reps:'회',minutes:'분'};
  const muscleLabels = {back:'등',arms:'팔·전완',core:'몸통',legs:'하체',shoulders:'어깨',chest:'가슴',cardio:'전신'};
  const fallback = {
    products:[{id:'OPB01',name:'오브제 와이드 풀업바',url:MALL+'/product/detail.html?product_no=126',status:'available'},{id:'STM02',name:'스텝메이트 프로+',url:MALL+'/product/detail.html?product_no=100',status:'available'}],
    exercises:[{id:'hang',name:'매달리기',product_id:'OPB01',unit:'초',min:1,max:3600,muscles:['back','arms'],note:'내가 매달린 시간을 기록해 보세요.'},{id:'pullup',name:'턱걸이',product_id:'OPB01',unit:'회',min:1,max:500,muscles:['back','arms'],note:'완료한 횟수를 기록해 보세요.'},{id:'step',name:'스텝 운동',product_id:'STM02',unit:'분',min:1,max:240,muscles:['legs'],note:'운동한 시간을 기록해 보세요.'},{id:'squat',name:'맨몸 스쿼트',product_id:null,unit:'회',min:1,max:500,muscles:['legs','core'],note:'기구 없이 완료한 횟수를 기록해 보세요.'}]
  };
  const state = {mode:'guest',tab:'today',session:{authenticated:false,auth_configured:false},catalog:fallback,summary:null,registrations:[],demo:null,selectedExercise:null,busy:false};
  let toastTimer;
  let pendingRecordRequest=null;
  let timerTick;
  const movementTimer={elapsed:0,anchor:null};
  function timerElapsed(){return movementTimer.elapsed+(movementTimer.anchor===null?0:performance.now()-movementTimer.anchor);}
  function pauseTimer(){movementTimer.elapsed=timerElapsed();movementTimer.anchor=null;clearInterval(timerTick);timerTick=null;}
  function drawTimer(){const output=$('#timer-output');if(!output)return;const elapsed=Math.floor(timerElapsed()/1000);output.textContent=`${String(Math.floor(elapsed/60)).padStart(2,'0')}:${String(elapsed%60).padStart(2,'0')}`;const button=$('[data-action="timer-toggle"]');if(button)button.textContent=movementTimer.anchor===null?(elapsed?'측정 이어가기':'측정 시작'):'일시정지';}
  function timerPanel(){return `<div id="movement-timer" class="movement-timer"${state.selectedExercise==='hang'?'':' hidden'}><div class="timer-head"><div><p class="eyebrow">MY MOVEMENT TIMER</p><span class="form-note">매달린 시간을 직접 측정해요.</span></div><output id="timer-output" aria-label="측정 경과 시간">00:00</output></div><div class="timer-controls"><button type="button" class="button soft" data-action="timer-toggle">측정 시작</button><button type="button" class="text-button" data-action="timer-reset">초기화</button><button type="button" class="text-button" data-action="timer-apply">기록칸에 적용 ↗</button></div></div>`;}
  const today = () => dateKey(new Date());
  function dateKey(date) { return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`; }
  function plusDay(key, amount) { const date = new Date(`${key}T12:00:00`); date.setDate(date.getDate()+amount); return dateKey(date); }
  function shortDate(key) { const parts = String(key).split('-'); return `${Number(parts[1])}.${Number(parts[2])}`; }
  function unit(exercise) { return labels[exercise?.unit] || exercise?.unit || '회'; }
  function exercise(id) { return state.catalog.exercises.find(item => item.id === id); }
  function product(id) { return state.catalog.products.find(item => item.id === id); }
  function notify(message) { const toast = $('#toast'); toast.textContent = message; toast.hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => { toast.hidden = true; }, 4200); }
  async function api(path, options = {}) {
    const response = await fetch(path,{credentials:'same-origin',...options,headers:{'Content-Type':'application/json',...(options.headers || {})}});
    const data = await response.json().catch(() => ({}));
    if (response.status === 401) { state.mode='guest'; state.session.authenticated=false; render(); throw new Error('자사몰 회원 연결 후 이용해 주세요.'); }
    if (!response.ok) {const errors={invalid_origin:'보안 확인에 실패했어요. 페이지를 새로고침한 뒤 다시 시도해 주세요.',invalid_product:'제품을 다시 선택해 주세요.',invalid_channel:'구매처를 다시 선택해 주세요.',invalid_order:'주문번호는 3자 이상 입력해 주세요.',invalid_date:'2000년 이후 오늘까지의 날짜를 선택해 주세요.',invalid_value:'이 운동에 입력할 수 있는 범위를 확인해 주세요.',product_not_registered:'먼저 내 기구 탭에서 이 제품을 등록해 주세요.',daily_limit:'오늘의 기록 한도에 도달했어요. 내일 다시 기록해 주세요.',not_found:'해당 기록을 찾을 수 없어요. 페이지를 새로고침해 주세요.'};throw new Error(data.message || errors[data.error] || '요청을 처리하지 못했어요. 잠시 후 다시 시도해 주세요.');}
    return data;
  }
  function illustration() {
    return `<svg viewBox="0 0 300 280" fill="none" aria-hidden="true"><ellipse cx="157" cy="254" rx="104" ry="10" fill="#dddcd6"/><path d="M56 61v191M254 61v191M47 52h216" stroke="#b8bcb3" stroke-width="7" stroke-linecap="round"/><path d="M65 52h180" stroke="#101820" stroke-width="8" stroke-linecap="round"/><path d="m126 152-7 41-8 52M161 155l7 43 17 46" stroke="#303c37" stroke-width="19" stroke-linecap="round"/><path d="m127 107-19-22-4-32M160 107l24-23 7-31" stroke="#b99a84" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/><path d="M127 102c11-5 24-4 34 2l7 52c-18 9-32 8-48 0z" fill="#7a5040"/><circle cx="144" cy="81" r="17" fill="#c9ab94"/><path d="M128 78c-3-21 34-27 34 0-7-4-12-10-12-10-4 7-11 10-22 10" fill="#303c37"/><path d="m103 52 1-7m87 7 2-7" stroke="#b99a84" stroke-width="9" stroke-linecap="round"/><path d="m102 248 15 1m60-1 16 1" stroke="#101820" stroke-width="8" stroke-linecap="round"/><path d="M231 231c1-20 3-25 12-34-2 18-5 25-12 34M231 246c-7-19-13-24-22-28 6 16 11 22 22 28" fill="#8c9b85"/><path d="M231 253v-25" stroke="#8c9b85" stroke-width="2"/></svg>`;
  }
  function setTab(tab) { state.tab=tab; render(); window.scrollTo({top:0,behavior:'auto'}); $('#main').focus({preventScroll:true}); }
  function header(title, eyebrow, extra='') { const date = new Date(); return `<div class="page-heading"><div><p class="eyebrow">${eyebrow}</p><h1>${title}</h1><span class="date-label">${date.getFullYear()}년 ${date.getMonth()+1}월 ${date.getDate()}일 ${['일','월','화','수','목','금','토'][date.getDay()]}요일</span></div>${extra}</div>`; }
  function renderEntry() {
    return `<section class="entry"><div class="entry-hero"><div><p class="eyebrow">A LITTLE, EVERY DAY</p><h1>기구를 산 다음,<br>운동하는 일상으로.</h1><p class="muted">내 기구를 등록하고 오늘의 움직임을 남겨보세요. 작은 기록이 쌓이면 다음 운동이 보입니다.</p></div><div class="entry-art">${illustration()}</div></div><div class="entry-steps"><div><span>01 / CONNECT</span><h3>자사몰 회원으로 시작</h3><p>핏에이블 회원 계정에<br>내 기구와 기록을 모아요.</p></div><div><span>02 / MOVE</span><h3>오늘 운동을 짧게 기록</h3><p>시간과 횟수로 남기는<br>나만의 운동 일지.</p></div><div><span>03 / CONTINUE</span><h3>다음 움직임 찾기</h3><p>내 기록과 기구를 바탕으로<br>이어갈 운동을 살펴봐요.</p></div></div><div class="entry-actions"><h2>핏에이블 회원과 연결하기</h2><p class="muted">기존 자사몰 회원은 같은 계정으로 시작해요.<br>다른 쇼핑몰에서 구매하신 분도 가입할 수 있어요.</p><div class="button-row">${state.session.auth_configured ? '<a href="/api/auth/start" class="button primary">회원 연결하기 ↗</a>' : `<a href="${MALL}/member/login.html" class="button primary" target="_blank" rel="noopener">자사몰 로그인 ↗</a>`}<a href="${MALL}/member/join.html" class="button secondary" target="_blank" rel="noopener">회원가입 ↗</a></div>${!state.session.auth_configured ? '<p class="form-note">자사몰 가입·로그인은 새 창에서 진행됩니다. 이 페이지와 회원 정보를 연결하는 기능은 준비 중이에요.</p>' : '<p class="form-note">자사몰 인증 화면에서 로그인하며 이 페이지에서 비밀번호를 받지 않아요.</p>'}<div class="entry-demo">가입 전에 화면을 둘러보세요. 체험 기록은 이 브라우저에만 저장되며 실제 제품 등록·보증 접수로 전달되지 않아요.<button class="text-button" type="button" data-action="start-demo">예시 계정으로 체험하기 <span aria-hidden="true">→</span></button></div></div><p class="footer-note">FITABLE · MAKE MOVEMENT PART OF YOUR DAY</p></section>`;
  }
  function stats() { const m=state.summary.metrics; return `<div class="stats"><div class="stat"><span class="label">이번 주 운동</span><strong>${m.week_days || 0}<small>일</small></strong></div><div class="stat"><span class="label">연속 기록</span><strong>${m.streak || 0}<small>일</small></strong></div><div class="stat"><span class="label">함께 움직인 날</span><strong>${m.total_days || 0}<small>일</small></strong></div></div>`; }
  function renderToday() {
    const summary=state.summary, count=summary.records.filter(item=>item.performed_on===today()).length;
    const owned=state.summary.owned_products || [];
    const available=state.catalog.exercises.filter(ex=>!ex.product_id || owned.includes(ex.product_id));
    if (!available.some(ex=>ex.id===state.selectedExercise)) state.selectedExercise=available[0]?.id;
    const selected=exercise(state.selectedExercise);
    return `${header('오늘도, 내 페이스로.','YOUR DAILY MOVEMENT','<span class="pill">나의 운동 일지</span>')}<section class="hero"><div class="hero-copy"><p class="eyebrow">SMALL MOVES. REAL PROGRESS.</p><h2>${count ? '오늘의 움직임을<br>남겼어요.' : '가볍게 시작해요.<br>기록 하나부터.'}</h2><p class="muted">어제와 비교하지 않아도 괜찮아요.<br>내가 움직인 만큼, 내 기록으로.</p><div class="hero-count"><strong>${count}</strong><span>오늘 남긴 기록</span></div></div><div class="hero-art">${illustration()}</div></section>${stats()}<div class="two-columns"><section class="card"><div class="section-head"><div><p class="eyebrow">QUICK RECORD</p><h2>오늘의 움직임 남기기</h2></div><span class="number-tag">01</span></div><form id="record-form"><label>어떤 운동을 했나요?<select name="exercise_id" required>${available.map(item=>`<option value="${esc(item.id)}"${item.id===state.selectedExercise?' selected':''}>${esc(item.name)}${item.product_id?` · ${esc(product(item.product_id)?.name||item.product_id)}`:' · 맨몸'}</option>`).join('')}</select></label><div class="inline-fields"><label>운동 기록<div class="input-unit"><input type="number" name="value" min="${selected?.min || 1}" max="${selected?.max || 100000}" step="1" required inputmode="numeric" placeholder="0" aria-describedby="exercise-note"><span id="record-unit">${esc(unit(selected))}</span></div></label><label>운동한 날<input name="performed_on" type="date" min="2000-01-01" max="${today()}" value="${today()}" required></label></div><p id="exercise-note" class="form-note">${esc(selected?.note || '완료한 운동의 시간이나 횟수를 기록해 주세요.')}</p>${timerPanel()}<p class="form-error" id="record-error" role="alert"></p><button type="submit" class="button primary full">기록 남기기 <span aria-hidden="true">↗</span></button></form></section><section class="card">${challengeCard()}</section></div><p class="footer-note">내 속도로 쌓는 움직임의 기록</p>`;
  }
  function challengeCard() {
    const challenge=state.summary.challenge;
    if (!challenge?.started_at) return `<div class="section-head"><div><p class="eyebrow">30 DAYS OF MOVEMENT</p><h2>30일, 나와의 약속</h2></div><span class="number-tag">02</span></div><p class="muted">매일 완벽할 필요 없어요.<br>운동한 날을 하나씩 채워보세요.</p><div class="calendar" aria-hidden="true">${Array.from({length:30},(_,i)=>`<span class="calendar-day">${i+1}</span>`).join('')}</div><p class="metric-note">운동 기록이 있는 날짜에 표시돼요.<br>시작일부터 30일 동안 내 습관을 살펴봐요.</p><button type="button" class="button soft full challenge-start" data-action="start-challenge">오늘부터 시작하기 →</button>`;
    const days=challenge.days||[];
    return `<div class="section-head"><div><p class="eyebrow">30 DAYS OF MOVEMENT</p><h2>30일, 나와의 약속</h2></div><span class="pill">${Math.min(challenge.day_index || 1,30)}일째</span></div><p class="muted">${shortDate(challenge.started_at.slice(0,10))}에 시작한 나의 작은 약속.<br>지금까지 ${challenge.completed_days || 0}일 움직였어요.</p><div class="calendar" aria-label="30일 운동 기록">${days.map((day,i)=>`<span class="calendar-day${day.done?' done':''}${day.date===today()?' current':''}" title="${esc(day.date)}${day.done?' 운동 기록 있음':' 운동 기록 없음'}" aria-label="${esc(day.date)} ${day.done?'기록 있음':'기록 없음'}">${i+1}</span>`).join('')}</div><div class="calendar-caption"><span>시작 ${shortDate(challenge.started_at.slice(0,10))}</span><span>● 기록한 날</span></div><div class="progress-track"><i data-width="${Math.min(100,(challenge.completed_days || 0)/30*100)}"></i></div><p class="challenge-foot"><strong>${challenge.completed_days || 0}</strong> / 30일 기록</p>`;
  }
  function recordRows(records) {
    if (!records.length) return '<div class="empty"><div class="empty-mark">＋</div><h3>첫 번째 움직임을 기다려요.</h3><p>오늘 탭에서 운동 기록을 남겨보세요.</p></div>';
    return records.map(record=>{ const ex=exercise(record.exercise_id); return `<div class="record-row"><div class="record-info"><strong>${esc(ex?.name || record.exercise_id)}</strong><small>${esc(record.performed_on)} · ${esc(product(ex?.product_id)?.name || '맨몸 운동')}</small></div><span class="record-value">${esc(record.value)}<small>${esc(unit(ex))}</small></span><button class="delete-button" type="button" data-delete="${esc(record.id)}" aria-label="${esc(record.performed_on)} ${esc(ex?.name || '')} ${esc(record.value)} ${esc(unit(ex))} 기록 삭제">삭제</button></div>`; }).join('');
  }
  function renderHistory() {
    const summary=state.summary, growth=summary.metrics.growth, best=summary.metrics.best;
    const growthExercise=exercise(growth?.exercise_id || best?.exercise_id);
    const plotted=summary.records.filter(item=>item.exercise_id===growthExercise?.id).slice().sort((a,b)=>String(a.performed_on).localeCompare(String(b.performed_on))).slice(-7);
    const max=Math.max(1,...plotted.map(item=>Number(item.value)));
    const muscles=summary.muscles || [], maximum=Math.max(1,...muscles.map(item=>item.count));
    return `${header('쌓인 기록이 나의 변화.','MY MOVEMENT JOURNAL')}${stats()}<div class="two-columns history-layout"><section class="card"><div class="section-head"><div><p class="eyebrow">MY OWN BENCHMARK</p><h2>나의 첫 기록부터 지금까지</h2></div></div>${growthExercise ? `<p class="muted">${esc(growthExercise.name)} · ${esc(unit(growthExercise))} 기준</p><div class="growth"><strong>${esc(growth?.best ?? best?.value ?? 0)}<span>${esc(unit(growthExercise))}</span></strong><span>내 최고 기록</span></div><div class="spark-bars" role="img" aria-label="최근 ${plotted.length}개 ${esc(growthExercise.name)} 기록: ${esc(plotted.map(item=>`${item.performed_on} ${item.value}${unit(growthExercise)}`).join(', '))}">${plotted.map(item=>`<div class="spark-col"><i data-height="${Math.max(3,Number(item.value)/max*100)}" title="${esc(item.value)}${esc(unit(growthExercise))}"></i><span>${shortDate(item.performed_on)}</span></div>`).join('')}</div><p class="metric-note">${growth ? `첫 기록 ${esc(growth.first)}${esc(unit(growthExercise))} → 최고 ${esc(growth.best)}${esc(unit(growthExercise))}${Number(growth.delta)>0?` · ${esc(growth.delta)}${esc(unit(growthExercise))} 늘었어요.`:''}` : '기록이 쌓이면 첫 기록과 최고 기록을 비교할 수 있어요.'}<br>같은 운동의 최근 기록을 표시해요.</p>` : '<div class="empty"><div class="empty-mark">↗</div><h3>변화는 첫 기록에서 시작돼요.</h3><p>같은 운동을 기록하면 변화를 볼 수 있어요.</p></div>'}<div class="rank-placeholder"><strong>— %</strong><p>다른 회원과의 순위는 아직 제공하지 않아요.<br>지금은 나의 이전 기록을 기준으로 살펴보세요.</p></div></section><section class="card"><p class="eyebrow">WHERE I MOVED</p><h2>최근 7일, 기록한 운동의 부위</h2>${muscles.length ? `<div class="muscle-list">${muscles.map(item=>`<div class="muscle-line"><span>${esc(item.label || muscleLabels[item.id] || item.id)}</span><div class="track"><i data-width="${Math.max(0,Math.min(100,item.count/maximum*100))}"></i></div><small>${esc(item.count)}건</small></div>`).join('')}</div>` : '<div class="empty">기록을 남기면 운동의 부위 태그가 모여요.</div>'}<p class="metric-note">최근 7일의 운동별 부위 태그를 기록 건수로 합산했어요. 실제 근육 사용량이나 회복 상태를 측정한 수치는 아니에요.</p></section></div><section class="card subhead"><div class="section-head"><div><p class="eyebrow">EVERY MOVE COUNTS</p><h2>나의 운동 기록</h2></div><span class="number-tag">${summary.records.length} RECORDS</span></div>${recordRows(summary.records.slice().sort((a,b)=>String(b.performed_on).localeCompare(String(a.performed_on)) || String(b.created_at || b.id).localeCompare(String(a.created_at || a.id))))}</section>`;
  }
  function renderNext() {
    const recs=state.summary.recommendations || [];
    return `${header('다음 움직임을 찾아요.','YOUR NEXT MOVE')}<section class="hero compact"><div class="hero-copy"><p class="eyebrow">KEEP YOUR MOMENTUM</p><h2>내 기구로,<br>다음 운동 찾기.</h2><p class="muted">내가 가진 기구와 운동 기록을 살펴<br>다음에 기록할 수 있는 운동을 모았어요.</p></div><div class="hero-art">${illustration()}</div></section><section class="card"><div class="section-head"><div><p class="eyebrow">EXPLORE YOUR MOVEMENT</p><h2>이 운동도 살펴보세요</h2></div></div>${recs.length ? recs.map((rec,i)=>{ const ex=exercise(rec.exercise_id); if(!ex)return ''; const gear=product(rec.product_id || ex.product_id); return `<article class="recommendation"><div class="exercise-icon" aria-hidden="true">${String(i+1).padStart(2,'0')}</div><div><h3>${esc(ex.name)}</h3><p>${esc(rec.reason)}</p><div class="tag-list">${(ex.muscles || []).map(m=>`<span class="tag">${esc(muscleLabels[m] || m)}</span>`).join('')}<span class="tag">${gear?esc(gear.name):'기구 없이'}</span></div>${rec.owned || !ex.product_id ? `<button type="button" class="button soft" data-exercise="${esc(ex.id)}">이 운동 기록하기 →</button>` : `${gear?.url && safeURL(gear.url) ? `<a href="${esc(gear.url)}" class="button secondary" target="_blank" rel="noopener">기구 살펴보기 ↗</a>` : ''}<button type="button" class="text-button register-inline" data-action="register">기구가 있나요? 등록하기</button>`}</div></article>`; }).join('') : '<div class="empty">기구를 등록하거나 운동을 기록하면 이어갈 운동을 볼 수 있어요.</div>'}</section><div class="notice-card"><strong>기록을 바탕으로 살펴보는 운동</strong>등록한 기구와 운동 부위의 기록 횟수를 바탕으로 구성한 목록이에요. 개인의 건강 상태나 운동 강도를 판단하는 맞춤 처방은 제공하지 않아요. 몸 상태에 맞춰 운동해 주세요.</div>`;
  }
  function safeURL(value) { try { const url=new URL(value); return url.protocol==='https:'; } catch { return false; } }
  function renderGear() {
    return `${header('운동의 시작, 내 기구.','MY FITABLE')}<section class="card"><div class="section-head"><div><p class="eyebrow">YOUR EQUIPMENT</p><h2>나와 함께하는 기구</h2></div><button type="button" class="text-button" data-action="register">＋ 기구 등록</button></div>${state.registrations.length ? state.registrations.map(reg=>`<div class="gear-row"><div class="gear-monogram">${esc(reg.product_id)}</div><div class="record-info"><strong>${esc(product(reg.product_id)?.name || reg.product_id)}</strong><small>${esc(reg.purchased_at || '')}${state.mode==='demo'?' · 체험 등록':''}</small></div><span class="owned-status${reg.status==='verified'?' verified':''}">${reg.status==='verified'?'구매 확인 완료':reg.status==='rejected'?'확인 필요':'구매 확인 대기'}</span></div>`).join('') : '<div class="empty"><div class="empty-mark">＋</div><h3>내 기구를 만나볼까요?</h3><p>구매처가 달라도 등록할 수 있어요.<br>등록 요청 후 기구에 맞게 기록할 수 있어요. 보증 확인은 별도로 진행됩니다.</p><button class="button soft" type="button" data-action="register">내 기구 등록하기 →</button></div>'}</section><div class="notice-card"><strong>기구 등록과 보증 확인</strong>제품·구매처·주문번호·구매일로 등록을 요청할 수 있어요. 담당자가 구매 내역을 확인하며 제품별 보증 조건이 적용됩니다. 추가 보증 혜택은 확정된 안내에 따라 제공됩니다.${state.mode==='demo'?'<br>체험에서는 예시 주문번호만 사용하며 실제 구매 확인이나 보증 접수가 진행되지 않아요.':''}</div><section class="card subhead"><p class="eyebrow">START WITH WHAT YOU HAVE</p><h2>기구별 기록할 수 있는 운동</h2>${state.catalog.products.map(gear=>`<div class="gear-row"><div class="gear-monogram">${esc(gear.id)}</div><div class="record-info"><strong>${esc(gear.name)}</strong><small>${esc(state.catalog.exercises.filter(ex=>ex.product_id===gear.id).map(ex=>ex.name).join(' · ') || '운동 준비 중')}</small></div></div>`).join('')}</section>`;
  }
  function render() {
    pauseTimer();
    const active=state.mode!=='guest';
    $('.bottom-nav').hidden=!active;
    $('#account-button').textContent=state.mode==='demo'?'체험 계정':state.mode==='real'?(state.session.member?.label || '내 계정'):'회원 연결';
    $('#mode-banner').hidden=state.mode!=='demo';
    $('#mode-banner').innerHTML='체험 모드 · 기록은 이 브라우저에만 저장돼요. 실제 개인정보는 입력하지 마세요.<button type="button" data-action="leave-demo">체험 종료</button>';
    $$('[data-tab]').forEach(button=>{if(button.dataset.tab===state.tab)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');});
    $('#main').innerHTML=!active?renderEntry():state.tab==='history'?renderHistory():state.tab==='next'?renderNext():state.tab==='gear'?renderGear():renderToday();
    $$('[data-width]').forEach(item=>{item.style.width=`${Number(item.dataset.width)}%`;});
    $$('[data-height]').forEach(item=>{item.style.height=`${Number(item.dataset.height)}%`;});
    bindForms();
    drawTimer();
  }
  function saveDemo() { try { localStorage.setItem(STORE,JSON.stringify(state.demo)); } catch { notify('브라우저 저장 공간을 사용할 수 없어 이번 화면에서만 기록이 유지돼요.'); } }
  function startDemo() {
    state.mode='demo';
    let saved;
    try { saved=JSON.parse(localStorage.getItem(STORE) || 'null'); } catch { saved=null; }
    state.demo=saved && Array.isArray(saved.records) && Array.isArray(saved.registrations)?sanitizeDemo(saved):{records:[],registrations:[],challenge:null};
    state.registrations=state.demo.registrations; state.summary=computeDemo(); render(); notify('체험을 시작했어요. 예시 정보로 기구와 운동을 기록해 보세요.');
  }
  function validDemoDate(key){return typeof key==='string' && /^\d{4}-\d{2}-\d{2}$/.test(key) && key>='2000-01-01' && key<=today() && dateKey(new Date(`${key}T12:00:00`))===key;}
  function sanitizeDemo(saved) {
    return {records:saved.records.filter(r=>r && exercise(r.exercise_id) && Number.isInteger(Number(r.value)) && Number(r.value)>=(exercise(r.exercise_id).min || 1) && Number(r.value)<=(exercise(r.exercise_id).max || 100000) && validDemoDate(r.performed_on)).map(r=>({id:String(r.id),exercise_id:r.exercise_id,value:Number(r.value),performed_on:r.performed_on,created_at:r.created_at})),registrations:saved.registrations.filter(r=>r && product(r.product_id)).map(r=>({id:String(r.id),product_id:r.product_id,purchased_at:r.purchased_at,channel:'demo',order_no:'DEMO-EXAMPLE',status:'pending'})),challenge:saved.challenge && validDemoDate(saved.challenge.started_at)?{started_at:saved.challenge.started_at}:null};
  }
  function computeDemo() {
    const records=state.demo.records, dates=new Set(records.map(r=>r.performed_on)), now=today();
    const currentDay=new Date(`${now}T12:00:00`), monday=plusDay(now,-((currentDay.getDay()+6)%7));
    let streak=0, cursor=dates.has(now)?now:plusDay(now,-1);
    while(dates.has(cursor)){streak++;cursor=plusDay(cursor,-1);}
    const groups=state.catalog.exercises.map(ex=>{ const list=records.filter(r=>r.exercise_id===ex.id).sort((a,b)=>a.performed_on.localeCompare(b.performed_on)||String(a.created_at).localeCompare(String(b.created_at))); return {ex,list,best:Math.max(0,...list.map(r=>r.value))};}).filter(group=>group.list.length);
    const latest=records.slice().reverse().sort((a,b)=>String(b.performed_on).localeCompare(String(a.performed_on))||String(b.created_at).localeCompare(String(a.created_at)))[0];
    const focus=groups.find(group=>group.ex.id===latest?.exercise_id);
    const muscleCounts={}; records.filter(r=>r.performed_on>=plusDay(now,-6)&&r.performed_on<=now).forEach(r=>(exercise(r.exercise_id)?.muscles || []).forEach(m=>{muscleCounts[m]=(muscleCounts[m] || 0)+1;}));
    const owned=[...new Set(state.demo.registrations.map(r=>r.product_id))];
    const muscleScore=ex=>(ex.muscles || []).reduce((sum,m)=>sum+(muscleCounts[m] || 0),0);
    const byMuscles=(a,b)=>muscleScore(a)-muscleScore(b)||a.id.localeCompare(b.id);
    const recommendations=state.catalog.exercises.filter(ex=>!ex.product_id || owned.includes(ex.product_id)).sort(byMuscles).slice(0,2).map(ex=>({exercise_id:ex.id,product_id:ex.product_id,owned:true,reason:records.length?'최근 7일 기록에 적게 나온 부위의 운동입니다.':'내 기구 또는 맨몸으로 기록을 시작할 수 있습니다.'}));
    const unowned=state.catalog.exercises.filter(ex=>ex.product_id && !owned.includes(ex.product_id)).sort(byMuscles);
    if(records.length && unowned.length){const ex=unowned[0];recommendations.push({exercise_id:ex.id,product_id:ex.product_id,owned:false,reason:'다른 기구로 할 수 있는 운동도 살펴보세요. 구매는 선택입니다.'});}
    let challenge=null;
    if(state.demo.challenge){ const start=state.demo.challenge.started_at; const days=Array.from({length:30},(_,i)=>({date:plusDay(start,i),done:dates.has(plusDay(start,i))}));challenge={started_at:start,day_index:Math.max(0,Math.min(30,Math.floor((new Date(`${now}T12:00:00`)-new Date(`${start}T12:00:00`))/86400000)+1)),completed_days:days.filter(d=>d.done).length,days}; }
    return {records,owned_products:owned,metrics:{week_days:[...dates].filter(d=>d>=monday&&d<=now).length,total_days:dates.size,streak,best:focus?{exercise_id:focus.ex.id,value:focus.best,unit:focus.ex.unit}:null,growth:focus?{exercise_id:focus.ex.id,first:focus.list[0].value,best:focus.best,delta:focus.best-focus.list[0].value,unit:focus.ex.unit}:null},muscles:['back','arms','legs','core'].map(id=>({id,label:muscleLabels[id] || id,count:muscleCounts[id] || 0})),challenge,recommendations,rank:{available:false,reason:'비교 표본이 충분하지 않아 순위를 제공하지 않습니다.'}};
  }
  async function refresh() {
    if(state.mode==='demo'){state.registrations=state.demo.registrations;state.summary=computeDemo();return;}
    const [summary,registrations]=await Promise.all([api('/api/summary'),api('/api/registrations')]);
    state.summary=summary;state.registrations=registrations.registrations || [];
  }
  function bindForms() {
    const form=$('#record-form'); if(!form)return;
    $('select[name="exercise_id"]',form).addEventListener('change',event=>{state.selectedExercise=event.target.value;const ex=exercise(state.selectedExercise);$('#record-unit').textContent=unit(ex);$('#exercise-note').textContent=ex?.note || '';const value=$('[name="value"]',form);value.min=ex?.min || 1;value.max=ex?.max || 100000;pauseTimer();const timer=$('#movement-timer');if(timer)timer.hidden=ex?.id!=='hang';drawTimer();});
    form.addEventListener('submit',async event=>{
      event.preventDefault();if(state.busy)return;const data=new FormData(form),value=Number(data.get('value')),performed=String(data.get('performed_on'));
      const selected=exercise(String(data.get('exercise_id')));
      if(!Number.isInteger(value)||value<(selected?.min || 1)||value>(selected?.max || 100000)){$('#record-error').textContent=`${selected?.min || 1}부터 ${selected?.max || 100000}까지의 정수를 입력해 주세요.`;return;}
      if(!/^\d{4}-\d{2}-\d{2}$/.test(performed)||performed<'2000-01-01'||performed>today()){$('#record-error').textContent='오늘 또는 이전 날짜를 선택해 주세요.';return;}
      const payload={exercise_id:String(data.get('exercise_id')),value,performed_on:performed,request_id:globalThis.crypto?.randomUUID?.() || `request-${Date.now()}-${Math.random().toString(36).slice(2)}`};
      const fingerprint=JSON.stringify([payload.exercise_id,payload.value,payload.performed_on]);if(pendingRecordRequest?.fingerprint===fingerprint)payload.request_id=pendingRecordRequest.request_id;else pendingRecordRequest={fingerprint,request_id:payload.request_id};
      const button=$('[type="submit"]',form);state.busy=true;button.disabled=true;button.textContent='기록 저장 중…';
      try{if(state.mode==='demo'){state.demo.records.push({id:payload.request_id,...payload,created_at:new Date().toISOString()});saveDemo();}else await api('/api/records',{method:'POST',body:JSON.stringify(payload)});await refresh();pendingRecordRequest=null;render();notify('오늘의 움직임을 기록했어요.');}catch(error){if($('#record-error'))$('#record-error').textContent=error.message;else notify(error.message);}finally{state.busy=false;if(button.isConnected){button.disabled=false;button.innerHTML='기록 남기기 <span aria-hidden="true">↗</span>';}}
    });
  }
  function openRegistration() {
    const form=$('#registration-form'),demo=state.mode==='demo';form.reset();$('#registration-error').textContent='';
    $('[name="product_id"]',form).innerHTML='<option value="">제품을 선택해 주세요</option>'+state.catalog.products.map(item=>`<option value="${esc(item.id)}">${esc(item.name)}</option>`).join('');
    const params=new URLSearchParams(location.search),query=params.get('product') || params.get('product_id');if(product(query))$('[name="product_id"]',form).value=query;
    const order=$('[name="order_no"]',form);order.readOnly=demo;order.value=demo?'DEMO-EXAMPLE':'';
    $('[name="purchased_at"]',form).max=today();$('[name="purchased_at"]',form).value=today();
    $('#registration-description').textContent=demo?'체험에서는 예시 주문번호를 사용해요. 실제 개인정보나 주문 내역은 저장하지 않아요.':'구매 내역에 표시된 정보를 입력해 주세요. 구매 확인 전까지 등록 요청 상태로 표시됩니다.';
    $('#registration-dialog').showModal();
  }
  $('#registration-form').addEventListener('submit',async event=>{
    event.preventDefault();if(state.busy)return;const form=event.currentTarget,data=new FormData(form),payload={product_id:String(data.get('product_id')),channel:String(data.get('channel')),order_no:state.mode==='demo'?'DEMO-EXAMPLE':String(data.get('order_no')).trim(),purchased_at:String(data.get('purchased_at'))};
    if(!product(payload.product_id)||!payload.channel||!payload.order_no||payload.purchased_at<'2000-01-01'||payload.purchased_at>today()){$('#registration-error').textContent='제품, 구매처, 주문번호, 구매일을 확인해 주세요.';return;}
    if(state.registrations.some(r=>r.product_id===payload.product_id && r.order_no===payload.order_no)){$('#registration-error').textContent='같은 제품과 주문번호로 이미 등록을 요청했어요.';return;}
    const button=$('[type="submit"]',form);state.busy=true;button.disabled=true;
    try{if(state.mode==='demo'){state.demo.registrations.push({id:`demo-${Date.now()}`,...payload,channel:'demo',status:'pending'});saveDemo();}else await api('/api/registrations',{method:'POST',body:JSON.stringify(payload)});await refresh();$('#registration-dialog').close();state.tab='gear';render();notify(state.mode==='demo'?'체험용 기구를 등록했어요. 실제 보증 접수는 진행되지 않아요.':'제품 등록을 요청했어요. 구매 확인을 기다려 주세요.');}catch(error){$('#registration-error').textContent=error.message;}finally{state.busy=false;button.disabled=false;}
  });
  async function startChallenge() {
    if(state.busy)return;state.busy=true;
    try{if(state.mode==='demo'){state.demo.challenge={started_at:today()};saveDemo();}else await api('/api/challenge',{method:'POST',body:'{}'});await refresh();render();notify('오늘부터 30일의 움직임을 모아볼게요.');}catch(error){notify(error.message);}finally{state.busy=false;}
  }
  async function deleteRecord(id,button) {
    if(state.busy)return;
    if(button.dataset.confirm!=='yes'){button.dataset.confirm='yes';button.textContent='삭제할까요?';setTimeout(()=>{if(button.isConnected){button.dataset.confirm='';button.textContent='삭제';}},4000);return;}
    state.busy=true;button.disabled=true;
    try{if(state.mode==='demo'){state.demo.records=state.demo.records.filter(r=>String(r.id)!==id);saveDemo();}else await api(`/api/records/${encodeURIComponent(id)}`,{method:'DELETE'});await refresh();render();notify('기록을 삭제했어요. 통계에도 반영했어요.');}catch(error){notify(error.message);}finally{state.busy=false;button.disabled=false;}
  }
  function openAccount() {
    if(state.mode==='guest'){document.querySelector('.entry-actions')?.scrollIntoView({behavior:'smooth',block:'center'});return;}
    $('#account-content').innerHTML=state.mode==='demo'?'<p class="muted">지금은 예시 계정으로 체험하고 있어요. 기록은 이 브라우저에만 저장되며 자사몰 계정이나 실제 보증 내역과 연결되지 않아요.</p><div class="button-row"><button type="button" class="button primary" data-action="leave-demo">체험 종료</button><button type="button" class="button secondary" data-action="clear-demo">체험 기록 초기화</button></div>':`<p class="muted">${esc(state.session.member?.label || '핏에이블 회원')}님의 회원 계정에 연결되어 있어요.</p><div class="account-actions"><a href="/api/export" class="button secondary full">내 기록 내려받기 ↗</a><button type="button" class="button secondary full" data-action="logout">로그아웃</button><button type="button" class="button secondary full danger-button" data-action="delete-account">이 서비스의 내 정보 삭제</button><p class="micro-note">제품 등록·운동 기록을 삭제합니다. 자사몰 회원 탈퇴와는 별개이며 삭제 후에는 되돌릴 수 없어요.</p></div>`;
    $('#account-dialog').showModal();
  }
  document.addEventListener('click',async event=>{
    const close=event.target.closest('[data-close-dialog]');if(close){close.closest('dialog').close();return;}
    const tab=event.target.closest('[data-tab]');if(tab){setTab(tab.dataset.tab);return;}
    const picked=event.target.closest('[data-exercise]');if(picked){state.selectedExercise=picked.dataset.exercise;setTab('today');$('#record-form')?.scrollIntoView({behavior:'smooth',block:'center'});return;}
    const del=event.target.closest('[data-delete]');if(del){await deleteRecord(del.dataset.delete,del);return;}
    const target=event.target.closest('[data-action]');if(!target)return;
    const action=target.dataset.action;
    if(action==='timer-toggle'){if(movementTimer.anchor!==null)pauseTimer();else{movementTimer.anchor=performance.now();timerTick=setInterval(drawTimer,200);}drawTimer();}
    if(action==='timer-reset'){pauseTimer();movementTimer.elapsed=0;drawTimer();}
    if(action==='timer-apply'){pauseTimer();drawTimer();const seconds=Math.floor(movementTimer.elapsed/1000),ex=exercise('hang');if(seconds<1){notify('1초 이상 측정한 뒤 적용해 주세요.');}else if(seconds>(ex?.max || 3600)){notify('측정 시간이 기록 가능한 범위를 넘었어요. 직접 기록을 확인해 주세요.');}else{const input=$('#record-form [name="value"]');if(input){input.value=seconds;input.focus();notify(`${seconds}초를 기록칸에 적용했어요. 기록 남기기를 눌러 저장해 주세요.`);}}}
    if(action==='start-demo')startDemo();
    if(action==='register')openRegistration();
    if(action==='start-challenge')await startChallenge();
    if(action==='leave-demo'){$$('dialog[open]').forEach(dialog=>dialog.close());state.mode='guest';state.demo=null;state.summary=null;state.registrations=[];render();window.scrollTo(0,0);}
    if(action==='clear-demo'){if(target.dataset.confirm!=='yes'){target.dataset.confirm='yes';target.textContent='한 번 더 누르면 초기화';return;}state.demo={records:[],registrations:[],challenge:null};saveDemo();await refresh();$('#account-dialog').close();render();notify('체험 기록을 초기화했어요.');}
    if(action==='delete-account'){if(target.dataset.confirm!=='yes'){target.dataset.confirm='yes';target.textContent='내 등록·기록을 모두 삭제할까요? 다시 눌러 확인';return;}try{await api('/api/account',{method:'DELETE'});$('#account-dialog').close();state.mode='guest';state.session.authenticated=false;render();notify('이 서비스의 내 정보를 삭제했어요. 자사몰 회원은 유지됩니다.');}catch(error){notify(error.message);}}
    if(action==='logout'){try{await api('/api/auth/logout',{method:'POST',body:'{}'});$('#account-dialog').close();state.mode='guest';state.session.authenticated=false;render();}catch(error){notify(error.message);}}
  });
  $('#account-button').addEventListener('click',openAccount);
  $$('dialog').forEach(dialog=>dialog.addEventListener('click',event=>{if(event.target===dialog){const bounds=dialog.getBoundingClientRect();if(event.clientX<bounds.left||event.clientX>bounds.right||event.clientY<bounds.top||event.clientY>bounds.bottom)dialog.close();}}));
  async function init() {
    if(location.protocol==='file:'){render();return;}
    try{
      const [sessionResult,catalogResult]=await Promise.allSettled([api('/api/session'),api('/api/catalog')]);
      if(sessionResult.status==='fulfilled')state.session=sessionResult.value;
      if(catalogResult.status==='fulfilled'&&Array.isArray(catalogResult.value.products)&&Array.isArray(catalogResult.value.exercises))state.catalog=catalogResult.value;
      if(state.session.authenticated){state.mode='real';await refresh();}
    }catch(error){state.mode='guest';notify('회원 데이터를 불러오지 못했어요. 잠시 후 새로고침해 주세요.');}
    render();
    if(state.mode==='real'&&new URLSearchParams(location.search).has('product'))openRegistration();
  }
  init();
})();
