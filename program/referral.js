'use strict';
// «친구에게 권하기» (2026-11-01). 서버 스위치(config/referral.json)가 꺼져 있으면 아무것도 그리지 않는다.
// 보상 문구·금액은 넣지 않는다(지급 미정). 친구 이름·연락처는 받지도 저장하지도 않는다.
(root=>{
 const S={data:null};
 const on=()=>Boolean(S.data&&S.data.enabled);
 const member=()=>on()&&S.data.member||null;
 const invited=()=>on()&&Boolean(S.data.invited);
 const isMobile=ua=>/Android|iPhone|iPad|iPod/i.test(String(ua||''));
 const smsHref=(text,ua)=>(/iPhone|iPad|iPod/i.test(String(ua||''))?'sms:&body=':'sms:?body=')+encodeURIComponent(String(text||''));
 function withLink(text,link){text=String(text||'').trim();return text.includes(link)?text:(text?text+'\n':'')+link;}
 async function request(path,options={}){const response=await fetch(path,{credentials:'same-origin',...options,headers:{'Content-Type':'application/json',...(options.headers||{})}});const data=await response.json().catch(()=>({}));if(!response.ok)throw Object.assign(new Error(data.error||'request_failed'),{status:response.status});return data;}
 // 실패해도 앱은 그대로 쓴다(권하기만 숨김). api() 의 401 처리(회원 상태 초기화)를 타지 않게 따로 부른다.
 async function load(){try{S.data=await request('/api/referral');}catch{S.data={enabled:false};}return S.data;}
 async function claim(){if(!on())return null;try{const r=await request('/api/referral/claim',{method:'POST',body:'{}'});if(r.recorded)await load();return r;}catch{return null;}}
 function inviteCard(esc,memberStart){if(!invited())return '';return `<section class="referral-invite" aria-labelledby="referral-invite-title"><p class="eyebrow">친구 추천</p><h2 id="referral-invite-title">친구가 핏에이블 루틴을 보냈어요</h2><p class="muted">와이드 풀업바로 매달리기부터 단계별로 운동하고 세트를 기록하는 서비스예요.</p><a class="button primary full" href="${esc(S.data.mall_url)}" target="_blank" rel="noopener">자사몰에서 와이드 풀업바 보기 ↗</a>${memberStart?'<p class="small">기구가 있으면 아래 «핏에이블 회원으로 시작»을 눌러 주세요. 회원으로 시작하면 이 링크를 보낸 친구가 함께 기록돼요.</p>':''}</section>`;}
 function promptCard(button){if(!member())return '';return `<section class="card referral-card"><h2>친구에게 권하기</h2><p class="muted">와이드 풀업바로 운동할 친구에게 내 링크를 보낼 수 있어요.</p>${button('내 링크 보내기','referral-open','soft full')}</section>`;}
 function inlinePrompt(button,text){if(!member())return '';return `<div class="referral-inline"><p class="small">${text}</p>${button('친구에게 권하기','referral-open','text-button')}</div>`;}
 function modal(esc,modalHead){const m=member();if(!m)return '';return `${modalHead('친구에게 권하기')}<div class="referral-modal"><p class="muted">이 링크로 들어온 친구가 핏에이블 회원으로 시작하면 내가 권한 것으로 기록돼요.</p><label class="field">내 링크<input id="referral-link" type="text" readonly value="${esc(m.link)}"></label><label class="field">보낼 문구<textarea id="referral-text" rows="4" maxlength="300">${esc(m.share_text)}</textarea></label><div class="referral-actions"><button class="button soft full" type="button" data-action="referral-copy">링크 복사</button><button class="button primary full" type="button" data-action="referral-share">카카오톡·문자로 보내기</button></div><p class="small section-gap">친구의 이름·연락처는 저장하지 않아요.${m.started_count?` 내 링크로 시작한 친구 ${Number(m.started_count)}명`:''}</p></div>`;}
 async function copyText(text,doc,nav){try{if(nav.clipboard&&nav.clipboard.writeText){await nav.clipboard.writeText(text);return true;}}catch{}const input=doc.getElementById('referral-link');if(!input)return false;input.focus();input.select();try{return doc.execCommand('copy');}catch{return false;}}
 // 보내기: 휴대폰 공유창(카카오톡·문자 등) → 없으면 휴대폰은 문자 앱, 컴퓨터는 문구 복사.
 async function share(text,env){const m=member();if(!m)return 'off';const body=withLink(text||m.share_text,m.link);if(env.nav.share){try{await env.nav.share({title:m.share_title,text:body});return 'shared';}catch(error){if(error&&error.name==='AbortError')return 'cancelled';}}if(isMobile(env.nav.userAgent)){env.go(smsHref(body,env.nav.userAgent));return 'sms';}return await copyText(body,env.doc,env.nav)?'copied_text':'failed';}
 async function action(name,ui){const doc=ui.doc||document,nav=ui.nav||navigator;if(name==='referral-open'){ui.openModal(modal(ui.esc,ui.modalHead));return;}const m=member();if(!m)return;if(name==='referral-copy'){ui.notify(await copyText(m.link,doc,nav)?'링크를 복사했어요.':'복사하지 못했어요. 링크를 길게 눌러 복사해 주세요.');return;}if(name==='referral-share'){const result=await share(doc.getElementById('referral-text')?.value,{nav,doc,go:ui.go||(href=>{location.href=href;})});if(result==='copied_text')ui.notify('보낼 문구를 복사했어요. 카카오톡이나 문자에 붙여 넣어 보내 주세요.');else if(result==='failed')ui.notify('보내지 못했어요. 링크 복사를 눌러 주세요.');}}
 const api={load,claim,on,member,invited,inviteCard,promptCard,inlinePrompt,modal,share,action,withLink,smsHref,isMobile,_set:data=>{S.data=data;}};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
 root.FitableReferral=api;
})(typeof globalThis!=='undefined'?globalThis:this);
