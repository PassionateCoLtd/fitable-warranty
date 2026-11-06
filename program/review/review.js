'use strict';
/* 검토 모드 전용 의견 도구. app.js reviewBoot() 가 /api/review/status 켜짐일 때만 붙인다(공개 정적 화면엔 안 붙음).
   앱 상태는 FitableReview.context() 로 읽기만 한다. 의견 화면의 탭·입력은 앱 처리기에 넘기지 않는다(전파 멈춤).
   고칠 곳 고르기는 투명 덮개로 받아서 앱 버튼·타이머가 눌리지 않는다. 핀은 «의견» 모드에서만 눌린다(평소엔 앱 탭을 가로채지 않음). */
(()=>{
 const R=globalThis.FitableReview;if(!R||document.getElementById('rv-root'))return;
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const asset=((document.currentScript?.src||'').match(/[?&]v=([^&]+)/)||[])[1]||'',version=((document.querySelector('script[src*="app.js"]')?.src||'').match(/[?&]v=([^&]+)/)||[])[1]||'';
 const modal=document.getElementById('modal'),root=document.createElement('div'),clamp=v=>Math.round(Math.min(1,Math.max(0,v))*1000)/1000;
 root.id='rv-root';root.dataset.mode='';root.innerHTML='<button type="button" class="rv-fab" data-rv="pick" aria-label="이 화면에 의견 남기기">의견</button><div class="rv-pins"></div><div class="rv-layer"></div><div class="rv-toast" role="status" aria-live="polite" hidden></div>';
 document.body.append(root);
 const $=s=>root.querySelector(s);let items=[],mode='',draft=null,lib=null,toastTimer=0,queued=false;
 try{root.dataset.pins=sessionStorage.getItem('fitable.review.pins')==='off'?'off':'on';}catch{root.dataset.pins='on';}
 const KEYS=['data-action','data-tab','data-filter','data-pick-item','data-pick-product','data-choose-exercise','data-select-exercise','data-level-choose','data-effort','data-guide-step'];
 const ERR={invalid_screenshot:'캡처를 저장하지 못했어요. 다시 누르면 캡처 없이 저장해요.',invalid_screen:'화면 정보를 읽지 못했어요. 새로고침한 뒤 다시 남겨 주세요.',invalid_state:'화면 정보를 읽지 못했어요. 새로고침한 뒤 다시 남겨 주세요.',review_login_required:'로그인이 풀렸어요. 새로고침한 뒤 다시 저장해 주세요.',invalid_origin:'이 주소에서는 저장할 수 없어요. 검토 주소로 다시 열어 주세요.',payload_too_large:'캡처가 너무 커요. 다시 누르면 캡처 없이 저장해요.',daily_limit:'오늘 남길 수 있는 의견 수를 넘었어요.',invalid_body:'의견을 2,000자 안으로 적어 주세요.'};
 function context(){try{const c=R.context();if(c&&typeof c.screen==='string')return c;}catch{}return {screen:'unknown',label:'알 수 없는 화면',state:{}};}
 function selector(el){const parts=[];for(let n=el;n&&n.nodeType===1&&n!==document.body&&n!==document.documentElement;n=n.parentElement){if(n.id){parts.unshift('#'+CSS.escape(n.id));break;}let p=n.localName;const key=KEYS.find(a=>n.hasAttribute(a));if(key)p+=`[${key}="${CSS.escape(n.getAttribute(key))}"]`;const same=n.parentElement?[...n.parentElement.children].filter(c=>c.localName===n.localName):[];if(same.length>1)p+=`:nth-of-type(${same.indexOf(n)+1})`;parts.unshift(p);}return parts.join(' > ')||'body';}
 function words(el){return String(el.getAttribute?.('aria-label')||el.innerText||el.value||el.getAttribute?.('alt')||'').replace(/\s+/g,' ').trim().slice(0,120);}
 function toast(text){const t=$('.rv-toast');t.textContent=text;t.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.hidden=true,4000);}
 function setMode(next,html=''){mode=next;root.dataset.mode=next;$('.rv-layer').innerHTML=html;schedule();}
 function close(){draft=null;setMode('');}
 function pick(){const n=items.filter(f=>f.screen===context().screen).length;setMode('pick',`<div class="rv-pick" data-rv="choose"><div class="rv-bar"><span>${n?`고칠 곳이나 번호를 눌러 주세요 · 이 화면 의견 ${n}개`:'고칠 곳을 눌러 주세요'}</span><button type="button" data-rv="pins">${root.dataset.pins==='off'?'핀 보이기':'핀 숨기기'}</button><button type="button" data-rv="cancel">취소</button></div></div>`);}
 function loadLib(){if(globalThis.html2canvas)return Promise.resolve();return lib||(lib=new Promise((ok,no)=>{const s=document.createElement('script');s.src='review/html2canvas.min.js?v='+encodeURIComponent(asset);s.onload=ok;s.onerror=()=>{lib=null;no(new Error('library'));};document.head.append(s);}));}
 // 보이는 화면만 JPEG 로. 열린 창(dialog)은 복제본에서 최상단에 다시 띄운다(복제본엔 «모달» 상태가 없어서).
 // html2canvas 가 돌려준 캔버스엔 scale 변환이 걸려 있어 표시 원은 변환을 지우고 그린다. noscript·건너뛰기 링크는 복제본에서 위로 새어 나와 뺀다.
 async function capture(x,y){await loadLib();const scale=Math.min(2,devicePixelRatio||1),open=Boolean(modal?.open);
  const canvas=await globalThis.html2canvas(document.documentElement,{x:scrollX,y:scrollY,width:innerWidth,height:innerHeight,windowWidth:document.documentElement.clientWidth,windowHeight:innerHeight,scale,logging:false,backgroundColor:'#ffffff',ignoreElements:n=>n.id==='rv-root'||n.localName==='noscript'||n.classList?.contains('skip-link'),onclone:doc=>{const m=doc.getElementById('modal');if(!open||!m)return;const b=doc.createElement('div');Object.assign(b.style,{position:'fixed',inset:'0',background:'rgba(23,33,59,.4)',zIndex:'2147482990'});m.before(b);Object.assign(m.style,{position:'fixed',inset:'0',margin:'auto',height:'fit-content',zIndex:'2147483000'});}});
  const g=canvas.getContext('2d');g.setTransform(1,0,0,1,0,0);g.lineWidth=3*scale;g.strokeStyle='#e5484d';g.beginPath();g.arc(x*scale,y*scale,16*scale,0,Math.PI*2);g.stroke();
  // 서버 한도(max_shot, JPEG 바이트)를 base64 길이로 바꿔 비교. 캔버스가 너무 크면 브라우저가 'data:,' 를 돌려준다.
  const limit=Math.floor((R.max_shot||1200000)*4/3);let url=canvas.toDataURL('image/jpeg',.72);if(url.length>limit)url=canvas.toDataURL('image/jpeg',.45);
  return !url.startsWith('data:image/jpeg')?{screenshot:null,screenshot_note:'capture_failed'}:url.length>limit?{screenshot:null,screenshot_note:'too_large'}:{screenshot:url,screenshot_note:''};}
 function choose(x,y){root.style.visibility='hidden';const el=document.elementFromPoint(x,y)||document.body;root.style.visibility='';
  const r=el.getBoundingClientRect(),c=context(),what=words(el);
  draft={screen:c.screen,screen_label:c.label,state:c.state||{},target:{selector:selector(el),text:what,x:r.width?clamp((x-r.left)/r.width):null,y:r.height?clamp((y-r.top)/r.height):null},viewport:{w:innerWidth,h:innerHeight,vx:clamp(x/innerWidth),vy:clamp(y/innerHeight),dpr:devicePixelRatio||1},app_version:version};
  setMode('write',`<div class="rv-dim" data-rv="dim"></div><div class="rv-sheet" role="dialog" aria-modal="true" aria-label="의견 남기기"><p class="rv-where"><strong>${esc(c.label)}</strong>${what?' · '+esc(what.slice(0,40)):''}</p><textarea id="rv-body" maxlength="2000" rows="4" placeholder="무엇을 어떻게 바꾸면 좋을지 적어 주세요. 키보드 마이크로 말해도 돼요."></textarea><p class="rv-meta" id="rv-shot">화면 캡처 중…</p><p class="rv-error" role="alert"></p><div class="rv-actions"><button type="button" class="rv-ghost" data-rv="cancel">취소</button><button type="button" class="rv-primary" data-rv="save">저장</button></div></div>`);
  const mine=draft;mine.shot=capture(x,y).catch(()=>({screenshot:null,screenshot_note:'capture_failed'})).then(s=>{if(draft===mine&&$('#rv-shot'))$('#rv-shot').textContent=s.screenshot?'화면 캡처를 같이 저장해요.':'캡처 없이 글만 저장해요.';return s;});
  $('#rv-body').focus();}
 async function save(button){const box=$('#rv-body'),body=box.value.replace(/\r\n?/g,'\n').replace(/[\u0000-\u0008\u000b-\u001f]/g,'').trim(),error=$('.rv-error'),mine=draft;if(!body){error.textContent='의견을 적어 주세요.';box.focus();return;}
  button.disabled=true;error.textContent='';$('#rv-shot').textContent='저장 중…';
  const shot=await Promise.race([mine.shot,new Promise(ok=>setTimeout(()=>ok({screenshot:null,screenshot_note:'capture_timeout'}),6000))]);
  const {shot:_,...rest}=mine,payload={...rest,body,...shot};let res=null,data={};
  try{res=await fetch('/api/review/feedback',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});data=await res.json().catch(()=>({}));}catch{}
  if(draft!==mine)return;
  if(!res||!res.ok){if(['payload_too_large','invalid_screenshot'].includes(data.error))mine.shot=Promise.resolve({screenshot:null,screenshot_note:'too_large'});error.textContent=ERR[data.error]||'저장하지 못했어요. 글은 그대로 있어요. 다시 눌러 주세요.';$('#rv-shot').textContent='';button.disabled=false;return;}
  items=[data.feedback,...items.filter(f=>f.id!==data.feedback.id)];close();toast(`${data.feedback.id}번 의견을 남겼어요.`);}
 function view(id){const f=items.find(x=>String(x.id)===String(id));if(!f)return;
  setMode('view',`<div class="rv-dim" data-rv="dim"></div><div class="rv-sheet rv-pop" role="dialog" aria-label="${f.id}번 의견"><p class="rv-where"><strong>${f.id}번 · ${esc(f.status_label)}</strong> · ${esc(f.screen_label)}</p><p class="rv-body">${esc(f.body)}</p><p class="rv-meta">${esc(f.author)} · ${esc(String(f.created_at).slice(5,16).replace('T',' '))}</p>${f.note||f.fixed_version?`<p class="rv-note">처리 메모 · ${esc(f.note||'')}${f.fixed_version?` (${esc(f.fixed_version)})`:''}</p>`:''}<div class="rv-actions"><button type="button" class="rv-ghost" data-rv="cancel">닫기</button></div></div>`);}
 function place(){queued=false;const box=$('.rv-pins');box.replaceChildren();if(root.dataset.pins==='off')return;const c=context();
  for(const f of items){if(f.screen!==c.screen||!f.target?.selector)continue;let el=null;try{el=document.querySelector(f.target.selector);}catch{}if(!el)continue;const r=el.getBoundingClientRect();if(!r.width&&!r.height)continue;
   const x=r.left+(f.target.x??.5)*r.width,y=r.top+(f.target.y??.5)*r.height;if(x<0||y<0||x>innerWidth||y>innerHeight)continue;
   const pin=document.createElement('button');pin.type='button';pin.className='rv-pin';pin.dataset.rv='pin';pin.dataset.id=f.id;pin.dataset.status=f.status;pin.textContent=f.id;pin.setAttribute('aria-label',`${f.id}번 의견 · ${f.status_label}`);pin.style.left=Math.min(innerWidth-12,Math.max(12,x))+'px';pin.style.top=Math.min(innerHeight-12,Math.max(12,y))+'px';box.append(pin);}}
 function schedule(){if(!queued){queued=true;requestAnimationFrame(place);}}
 async function load(){try{const res=await fetch('/api/review/feedback',{credentials:'same-origin',cache:'no-store'});if(res.ok){items=(await res.json()).feedback||[];schedule();}}catch{}}
 root.addEventListener('click',event=>{event.stopPropagation();const b=event.target.closest('[data-rv]');if(!b)return;const a=b.dataset.rv;
  // 시트 바깥(어둡게 깐 덮개)을 눌러도 앱 버튼이 눌리지 않는다. 글 쓰는 중이면 키보드만 내리고 글은 둔다.
  if(a==='dim'){if(mode==='view')close();else document.activeElement?.blur?.();return;}
  if(a==='pick')return pick();if(a==='cancel')return close();if(a==='save')return save(b);if(a==='pin')return view(b.dataset.id);
  if(a==='pins'){root.dataset.pins=root.dataset.pins==='off'?'on':'off';try{sessionStorage.setItem('fitable.review.pins',root.dataset.pins);}catch{}b.textContent=root.dataset.pins==='off'?'핀 보이기':'핀 숨기기';return schedule();}
  if(a==='choose'&&event.target===b)choose(event.clientX,event.clientY);});
 // 앱은 document 에서 click·input·change·submit 를 받는다 — 의견 화면 입력이 그쪽으로 새지 않게 여기서 멈춘다.
 ['input','change','submit','keyup','pointerdown','mousedown'].forEach(t=>root.addEventListener(t,e=>e.stopPropagation()));
 root.addEventListener('touchstart',e=>e.stopPropagation(),{passive:true});
 root.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Escape'&&mode){e.preventDefault();close();}});
 modal?.addEventListener('cancel',e=>{if(mode){e.preventDefault();close();}});
 // 앱 창(dialog)이 열리면 그 안으로 옮겨야 눌린다(모달 밖은 브라우저가 막음).
 if(modal)new MutationObserver(()=>{const host=modal.open?modal:document.body;if(root.parentNode!==host)host.append(root);schedule();}).observe(modal,{attributes:true,attributeFilter:['open']});
 const main=document.getElementById('main');if(main)new MutationObserver(schedule).observe(main,{childList:true});
 new MutationObserver(schedule).observe(document.body,{attributes:true,attributeFilter:['class']});
 addEventListener('scroll',schedule,{passive:true,capture:true});addEventListener('resize',schedule);setInterval(schedule,1000);
 setInterval(()=>{if(document.visibilityState==='visible'&&!mode)load();},30000);
 load();if('requestIdleCallback' in globalThis)requestIdleCallback(()=>loadLib().catch(()=>{}));
})();
