'use strict';
const $ = id => document.getElementById(id);
const form = $('registration');
const today = new Date();
$('date').max = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
const product = new URLSearchParams(location.search).get('product');
if (product && product !== 'OPB01') $('product-hint').textContent = '이 QR의 제품은 아직 지원 준비 중입니다. 표시된 제품이 맞는지 확인해 주세요.';
const channels = {cafe24:'핏에이블 공식몰',naver:'네이버',coupang:'쿠팡',other:'기타 구매처'};
const hints = {cafe24:'공식몰 마이페이지 → 주문내역에서 확인할 수 있습니다.',naver:'네이버페이 → 결제내역에서 주문번호를 확인해 주세요. 구매자 본인 확인은 별도로 진행합니다.',coupang:'마이쿠팡 → 주문목록에서 주문번호를 확인해 주세요.',other:'구매한 판매처의 주문내역에서 확인해 주세요.'};
const channel = () => form.querySelector('input[name=channel]:checked').value;
let proofSelected = false;
function updateChannel(){const c=channel();const need=c==='coupang'||c==='other';$('seller-field').hidden=c!=='other';$('seller').required=c==='other';$('proof-field').hidden=!need;$('proof').required=false;$('order-hint').textContent=hints[c];$('error').textContent='';}
form.querySelectorAll('input[name=channel]').forEach(el=>el.addEventListener('change',updateChannel));
$('proof-sample').addEventListener('click',()=>{proofSelected=true;$('proof-label').textContent='예시 증빙 선택됨 · 실제 파일은 사용하지 않습니다.';$('proof-sample').textContent='예시 증빙 선택 완료 ✓';});
$('sample').addEventListener('click',()=>{$('order').value='DEMO-ORDER-001';$('buyer').value='체험고객';$('phone').value='010-0000-0000';$('date').value=$('date').max;$('seller').value='예시 판매처';$('error').textContent='예시 정보가 입력되었습니다. 아래 체험 안내 확인 후 진행해 주세요.';});
function show(view,step){['member-view','input-view','review-view','done-view'].forEach(id=>$(id).hidden=id!==view);['step-member','step-one','step-two','step-three'].forEach((id,i)=>$(id).classList.toggle('active',i===step));$(view).setAttribute('tabindex','-1');$(view).focus();$('step-member').scrollIntoView({behavior:'smooth',block:'start'});}
form.addEventListener('submit',event=>event.preventDefault());
$('next').addEventListener('click',()=>{
 $('error').textContent='';
 if($('product').value!=='OPB01'){$('error').textContent='첫 체험 대상은 와이드 풀업바입니다. 제품을 다시 선택해 주세요.';return;}
 for(const id of ['buyer','order','seller']) $(id).value=$(id).value.trim();
 if(!form.reportValidity())return;
 const c=channel();
 if((c==='coupang'||c==='other')&&!proofSelected){$('error').textContent='구매 증빙 영역에서 예시 증빙을 선택해 주세요.';return;}
 const values=[['제품','오브제 와이드 풀업바'],['구매처',c==='other'?$('seller').value:channels[c]],['주문번호',$('order').value],['구매일',$('date').value],['이름',$('buyer').value],['연락처',$('phone').value],['구매 증빙',(c==='coupang'||c==='other')?'예시 증빙':'필요 시 추가 확인']];
 $('review-details').replaceChildren();
 for(const [key,value] of values){const row=document.createElement('div');const dt=document.createElement('dt');const dd=document.createElement('dd');dt.textContent=key;dd.textContent=value;row.append(dt,dd);$('review-details').append(row);}
 show('review-view',2);
});
$('back').addEventListener('click',()=>show('input-view',1));
$('finish').addEventListener('click',()=>{form.reset();$('review-details').replaceChildren();proofSelected=false;show('done-view',3);});
$('preview-start').addEventListener('click',()=>show('input-view',1));
$('member-back').addEventListener('click',()=>show('member-view',0));
$('restart').addEventListener('click',()=>{form.reset();proofSelected=false;$('proof-label').textContent='체험에서는 실제 파일을 업로드하지 않습니다.';$('proof-sample').textContent='예시 증빙 선택';updateChannel();show('member-view',0);});
updateChannel();
