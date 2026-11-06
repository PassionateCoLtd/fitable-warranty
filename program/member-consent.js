/* FITABLE workout consent presentation v1, 2026-11-06.
 * Only this app's Cafe24 customer consent page. No auth requests, token access,
 * collection, scope changes or automatic consent. Remove ScriptTag to revert.
 */
(function () {
  'use strict';
  if (!['fitablekorea.com','www.fitablekorea.com','m.fitablekorea.com'].includes(location.hostname) ||
      location.pathname !== '/protected/oauth_agreement.html') return;
  function apply() {
    const box = document.querySelector('.mOauthAgreement');
    const form = box && box.querySelector('form');
    const client = form && form.querySelector('input[name="client_id"]');
    const scope = form && form.querySelector('input[name="scope"]');
    if (!box || box.dataset.fitableConsent || !client || client.value !== 'xHodtb5AN9eAtrdLHop3JE' ||
        !scope || scope.value !== 'mall.read_customer_identifier' ||
        new URL(form.action, location.href).pathname !== '/exec/front/Member/OauthAgreement') return;
    const heading=box.querySelector('h1'), info=box.querySelector('.appInfo'), copy=box.querySelector(':scope > .txtAgreement'),
      title=box.querySelector('.titAgreement'), list=box.querySelector('.mList'), bottom=box.querySelector('.gBottom'),
      agree=box.querySelector('.btnAgree'), cancel=box.querySelector('.btnCancel'), icon=box.querySelector('.thumbnail img');
    if (![heading,info,copy,title,list,bottom,agree,cancel,icon].every(Boolean)) return;
    box.dataset.fitableConsent='v1';
    document.documentElement.classList.add('fitable-consent-page');
    const style=document.createElement('style');style.id='fitable-workout-consent-ui';
    style.textContent=`
html.fitable-consent-page{height:auto;min-height:100%;background:#f6f5f2}
.fitable-consent-page body{height:auto;min-height:100%;background:#f6f5f2;font-family:-apple-system,BlinkMacSystemFont,"Apple SD Gothic Neo","Noto Sans KR",sans-serif;color:#2f3a56}
.fitable-consent-page #ch-plugin{display:none!important}
.fitable-consent-page .mOauthAgreement{position:relative;inset:auto;width:calc(100% - 48px);max-width:460px;height:auto;margin:48px auto;padding:32px;background:#fff;border:1px solid #e7e6e1;border-radius:24px;box-shadow:0 8px 32px #26324b08;box-sizing:border-box;z-index:1000}
.fitable-consent-page .appInfo{margin:0 0 32px;padding:0;background:none;gap:12px;align-items:center}
.fitable-consent-page .appInfo .thumbnail{width:40px;height:40px;flex:0 0 40px;margin:0;border-radius:10px;background:#0f1822}
.fitable-consent-page .appInfo strong{font-size:15px;letter-spacing:-.3px;line-height:1.4}
.fitable-consent-page .mOauthAgreement h1{position:static;left:auto;width:auto;height:auto;overflow:visible;clip:auto;clip-path:none;white-space:normal;margin:8px 0 12px;font-size:29px;font-weight:750;line-height:1.35;letter-spacing:-1px;color:#2f3a56;word-break:keep-all}
.fitable-consent-page .fc-step{font-size:12px;font-weight:650;letter-spacing:.2px;color:#70836e;margin:0 0 10px}
.fitable-consent-page .fc-summary{font-size:15px;line-height:1.7;color:#667084;margin:0 0 28px;word-break:keep-all}
.fitable-consent-page .fc-fields{padding:20px;background:#f7f7f3;border:1px solid #e8e9e1;border-radius:14px;margin:0 0 20px}
.fitable-consent-page .titAgreement{font-size:12px;font-weight:500;line-height:1.5;letter-spacing:0;color:#667084;margin:0 0 10px}
.fitable-consent-page .mList.typeDot li{padding-left:0;font-size:17px;font-weight:650;line-height:1.5;letter-spacing:-.3px;color:#2f3a56}
.fitable-consent-page .mList.typeDot li:before{display:none}
.fitable-consent-page .fc-fields-note{font-size:13px;line-height:1.6;color:#667084;margin:8px 0 0;word-break:keep-all}
.fitable-consent-page .txtAgreement{font-size:12px;line-height:1.75;letter-spacing:0;color:#7a808c;margin:0 0 16px;word-break:keep-all;overflow-wrap:anywhere}
.fitable-consent-page .gBottom{position:static;inset:auto;width:100%;padding:0;box-sizing:border-box;margin-top:8px}
.fitable-consent-page .gBottom .txtAgreement{margin-bottom:24px}
.fitable-consent-page .btnAgree{box-sizing:border-box;min-height:54px;padding:16px 10px;margin-bottom:16px;border-radius:12px;background:#2f3a56;color:#fff;font-family:inherit;font-size:16px;font-weight:650;line-height:24px}
.fitable-consent-page .btnAgree:hover{background:#232d44}
.fitable-consent-page .btnAgree:focus-visible,.fitable-consent-page .btnCancel:focus-visible{outline:3px solid #72916e;outline-offset:4px}
.fitable-consent-page .btnCancel{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:0 20px;font-size:13px;color:#707887;line-height:1.5}
@media(max-width:600px){html.fitable-consent-page,.fitable-consent-page body{background:#fff}.fitable-consent-page .mOauthAgreement{width:100%;max-width:460px;margin:0 auto;padding:32px 24px max(24px,env(safe-area-inset-bottom));border:0;border-radius:0;box-shadow:none}.fitable-consent-page .mOauthAgreement h1{font-size:28px}}
@media(max-width:359px){.fitable-consent-page .mOauthAgreement{padding:24px 20px}.fitable-consent-page .mOauthAgreement h1{font-size:25px}.fitable-consent-page .appInfo{margin-bottom:24px}}
`;
    document.head.appendChild(style);
    icon.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent("<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"64\" height=\"64\" viewBox=\"0 0 64 64\"><rect width=\"64\" height=\"64\" fill=\"#0F1822\"/><g fill=\"#FFFFFF\" transform=\"translate(-52.525 -86.709) scale(0.40121)\"><path d=\"M 222.9375 299.964844 L 210.671875 299.964844 L 210.671875 283.613281 L 239.285156 283.613281 Z M 239.285156 263.175781 L 239.285156 279.527344 L 206.585938 279.527344 L 206.585938 328.578125 L 182.0625 304.050781 L 182.0625 263.175781 Z M 239.285156 263.175781\"/></g></svg>\n");icon.alt='FITABLE';
    box.prepend(info);
    const step=document.createElement('p');step.className='fc-step';step.textContent='핏에이블 루틴 · 회원 연결';info.after(step);
    heading.classList.remove('blind');heading.textContent='내 운동 기록을 계정에 연결해요';step.after(heading);
    const summary=document.createElement('p');summary.className='fc-summary';summary.textContent='매달리기와 턱걸이 기록을 저장하고, 기기를 바꿔도 같은 계정으로 이어볼 수 있어요';heading.after(summary);
    const fields=document.createElement('section');fields.className='fc-fields';summary.after(fields);fields.append(title,list);
    const note=document.createElement('p');note.className='fc-fields-note';note.textContent='내 기록을 구분하고 저장하는 데 사용해요';fields.append(note);
    fields.after(copy);
    // Preserve all provider notices and visible scope items; remove terminal
    // punctuation only. The original form and agreement() handler are untouched.
    box.querySelectorAll('.txtAgreement').forEach(p=>{if(p.childElementCount===0)p.textContent=p.textContent.trim().replace(/[.]$/,'');});
    agree.textContent='동의하고 운동 시작';
    cancel.removeAttribute('onclick');cancel.href='https://fitable-member.ngrok.app/';cancel.textContent='지금은 연결하지 않기';
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
})();
