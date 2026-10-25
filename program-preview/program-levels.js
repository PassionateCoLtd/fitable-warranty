'use strict';
/*
 * 와이드 풀업바 단계 프로그램 — 단계 정의는 이 파일 한 곳에만 둔다.
 * 수치마다 basis 로 근거를 단다: src 가 있으면 공개 자료(아래 sources), src 가 null 이면 자료가 직접 주지 않아 FITABLE 이 정한 값.
 * 근거 원문·확인 날짜: docs/program/SOURCES.md. 수치를 바꾸면 그 문서도 같이 고친다.
 * 금지: 반동(키핑)·점프로 올라가기·떨어지듯 내리기, 밴드 자동 추천, 1RM·상위%·회복도·부위 %.
 */
(function(root){
 const sources={
  acsm2026:{org:'ACSM(미국스포츠의학회)',title:'2026 저항운동 지침 발표(Resistance Training Guidelines Update 2026)',url:'https://acsm.org/resistance-training-guidelines-update-2026/',checked:'2026-10-24'},
  acsm2009:{org:'ACSM(미국스포츠의학회) 입장문',title:'건강한 성인의 저항운동 진행 모델(2009)',url:'https://pubmed.ncbi.nlm.nih.gov/19204579/',checked:'2026-10-24'},
  acsm_doms:{org:'ACSM(미국스포츠의학회) 안내지',title:'운동 뒤 늦게 오는 근육통(DOMS)',url:'https://web.archive.org/web/2016id_/http://www.acsm.org/docs/brochures/delayed-onset-muscle-soreness-(doms).pdf',checked:'2026-10-24'},
  latrobe2023:{org:'La Trobe·Swinburne 대학 연구진(The Conversation 게재)',title:'매달리기란? 어깨 위험과 안전하게 하는 법',url:'https://theconversation.com/what-are-dead-hangs-what-are-the-shoulder-pain-risks-and-how-do-i-do-them-safely-202346',checked:'2026-10-24'},
  usmc_guide:{org:'미 해병대(USMC)',title:'턱걸이 훈련 안내서(Pull-up Training Guide)',url:'https://web.archive.org/web/2024id_/https://www.marines.mil/Portals/1/Docs/PullupTrainingGuide.pdf',checked:'2026-10-24'},
  usmc_zero:{org:'미 해병대(USMC)',title:'0개부터 시작하는 턱걸이 프로그램(Starting From Zero)',url:'https://web.archive.org/web/2024id_/https://www.marines.mil/Portals/1/Docs/PullupTrainingProgramNovice.pdf',checked:'2026-10-24'},
  ace2015:{org:'ACE(미국운동협회)',title:'턱걸이를 익히는 4가지 동작',url:'https://www.acefitness.org/resources/pros/expert-articles/5565/4-moves-to-help-you-master-the-pull-up/',checked:'2026-10-24'},
  who:{org:'WHO(세계보건기구)',title:'신체활동 권고',url:'https://www.who.int/initiatives/behealthy/physical-activity',checked:'2026-10-24'},
  nhs:{org:'NHS(영국 국민보건서비스)',title:'근력·유연성 운동 안내',url:'https://www.nhs.uk/live-well/exercise/strength-and-flexibility-exercises/strength-and-flex-exercise-plan-how-to-videos/',checked:'2026-10-24'}
 };
 // basis.kind: source=자료 값 그대로 · within=자료가 준 범위 안에서 FITABLE 이 고름 · ours=자료가 직접 주지 않아 FITABLE 이 정함(src 는 참고한 자료, 없으면 null)
 const levels=[
  {id:'hang_start',stage:'철봉에 익숙해지기',name:'매달리기 첫걸음',goal:'hang',exercise_id:'hang',assistance:'none',
   summary:'철봉을 잡고 짧게 매달려요.',
   when:'턱걸이를 해 본 적이 없거나 오랜만이라면 여기서 시작해요.',
   plan:{target:10,planned_sets:2,rest_seconds:60},advance:{sessions:2},
   note:'10초가 어려우면 더 짧게 해도 괜찮아요. 힘들어지기 전에 발을 바닥에 천천히 내려요.',
   cues:[],
   stop:['지치기 전에 내려와요. 피곤하면 어깨가 덜 안정돼요.','어깨 힘을 완전히 풀고 축 늘어지지 않아요.','어깨가 빠진 적이 있거나 불안정하다면 시작 전에 전문가에게 맞는 운동인지 확인해요.'],
   basis:[{item:'처음 10초 이하',kind:'source',src:'latrobe2023'},{item:'2세트',kind:'within',src:'acsm2009'},{item:'1분 쉬기',kind:'within',src:'acsm2009'},{item:'점프해서 잡지 않기',kind:'source',src:'latrobe2023'},{item:'바닥에 서서 잡고 무릎을 굽혀 발 띄우기',kind:'ours',src:null}]},
  {id:'hang_build',stage:'철봉에 익숙해지기',name:'매달리기 늘리기',goal:'hang',exercise_id:'hang',assistance:'none',
   summary:'매달리는 시간을 조금씩 늘려요.',
   when:'10초씩 2세트가 편해졌다면.',
   plan:{target:20,planned_sets:3,rest_seconds:60},advance:{sessions:2},
   note:'처음엔 20초보다 짧아도 괜찮아요. 실제로 버틴 만큼 적어요.',
   cues:[],
   stop:['손이 미끄러지거나 잡는 힘이 풀리면 바로 발을 바닥에 내려요.'],
   basis:[{item:'20초',kind:'ours',src:'usmc_guide'},{item:'3세트',kind:'within',src:'acsm2009'},{item:'1분 쉬기',kind:'within',src:'acsm2009'}]},
  {id:'scapular',stage:'첫 턱걸이 준비',name:'어깨 내리기',goal:'first_pullup',exercise_id:'scapular_pull',assistance:'none',
   summary:'팔은 편 채, 어깨만 귀에서 멀어지게 내려요.',
   when:'20초씩 3세트 매달리기가 편해졌다면.',
   plan:{target:5,planned_sets:2,rest_seconds:60},advance:{sessions:2},
   note:'팔꿈치는 계속 펴 두세요. 몸이 아주 조금만 올라와도 맞게 하고 있어요.',
   cues:[],
   stop:['팔꿈치가 굽혀지거나 몸이 흔들리기 시작하면 그 세트는 여기까지 해요.'],
   basis:[{item:'팔을 편 채 어깨 내리기',kind:'source',src:'ace2015'},{item:'5회 · 2세트',kind:'source',src:'usmc_zero'},{item:'1분 쉬기',kind:'within',src:'acsm2009'}]},
  {id:'feet_assist',stage:'첫 턱걸이 준비',name:'발 디딤 턱걸이',goal:'first_pullup',exercise_id:'pullup',assistance:'feet',
   summary:'발끝을 바닥에 댄 채, 다리로 조금 도와 몸을 올려요.',
   when:'어깨 내리기 5회씩 2세트가 편해졌다면.',
   plan:{target:5,planned_sets:3,rest_seconds:120},advance:{sessions:2},
   note:'다리 힘은 필요한 만큼만 써요. 발끝은 바닥에 댄 채, 다리로 도와 올라가고 내려와요. 뛰거나 반동을 쓰지 않아요.',
   cues:['바 아래 바닥에 서서 두 손으로 바를 잡아요. 발끝은 바닥에 댄 채 시작해요.','다리로 바닥을 조금 밀며 팔로 당겨 올라가요. 발끝은 바닥에서 떼지 않아요.','내려올 때도 다리로 받치며 천천히 내려와요. 뛰지 않아요.'],
   stop:['팔꿈치·손목이 아프면 멈춰요.'],
   basis:[{item:'도움을 받는 턱걸이 단계',kind:'ours',src:'usmc_zero'},{item:'발끝을 바닥에 댄 채 다리로 돕기',kind:'ours',src:null},{item:'5회',kind:'ours',src:null},{item:'3세트',kind:'within',src:'acsm2009'},{item:'2분 쉬기',kind:'within',src:'acsm2009'}]},
  {id:'slow_lower',stage:'첫 턱걸이 준비',name:'천천히 내려오기',goal:'first_pullup',exercise_id:'negative_pullup',assistance:'none',
   summary:'바닥에서 다리로 밀며 올라간 뒤, 천천히 내려와요.',
   when:'발 디딤 턱걸이 5회씩 3세트가 편해졌다면.',
   plan:{target:2,planned_sets:3,rest_seconds:120},advance:{sessions:2},
   note:'1회 = 위에서 아래까지 3~5초 동안 천천히 내려오기. 이 속도를 지킨 횟수만 적어요.',
   prepare_check:'머리 위에 부딪힐 것이 없는지 확인해요.',
   cues:['바닥에서 다리로 밀며 팔로 당겨, 올라갈 수 있는 가장 높은 곳까지 올라가요. 점프해서 올라가지 않아요.','거기서 3~5초 동안 팔을 천천히 펴며 내려와요.','팔이 다 펴지면 발을 바닥에 천천히 내려요. 툭 떨어지지 않아요.'],
   stop:['내려오는 속도를 조절하지 못하고 툭 떨어지면 그 세트는 멈춰요. 자주 그러면 한 단계 내려가요.','내려오는 운동은 다음 날 근육이 더 뻐근할 수 있어요. 관절이 아프면 쉬어요.'],
   basis:[{item:'천천히 내려오기',kind:'source',src:'usmc_guide'},{item:'바닥에서 다리로 밀어 올라가기',kind:'ours',src:null},{item:'3~5초 동안',kind:'within',src:'usmc_guide'},{item:'2회 · 3세트',kind:'ours',src:'usmc_zero'},{item:'2분 쉬기',kind:'within',src:'acsm2009'}]},
  {id:'first_pullup',stage:'첫 턱걸이',name:'첫 턱걸이',goal:'first_pullup',exercise_id:'pullup',assistance:'none',
   summary:'도움 없이 1회 올라가 봐요.',
   when:'천천히 내려오기 2회씩 3세트가 편해졌다면.',
   plan:{target:1,planned_sets:2,rest_seconds:120},advance:{sessions:2},
   note:'안 되면 0회 시도로 남겨도 괜찮아요. 반동 없이 올라간 횟수만 세요.',
   prepare_check:'머리 위에 부딪힐 것이 없는지 확인해요.',
   cues:[],
   stop:['몸을 흔들거나 다리를 차서 올라갔다면 그 회는 세지 않아요.','목만 앞으로 빼서 턱을 올리지 않아요.'],
   basis:[{item:'1회 · 2세트',kind:'ours',src:null},{item:'2분 쉬기',kind:'within',src:'acsm2009'},{item:'반동 금지',kind:'source',src:'usmc_guide'}]},
  {id:'more_pullups',stage:'횟수 늘리기',name:'턱걸이 늘리기',goal:'more_pullups',exercise_id:'pullup',assistance:'none',
   summary:'한 세트에 하는 횟수를 조금씩 늘려요.',
   when:'턱걸이 1회씩 2세트가 된다면.',
   plan:{target:3,planned_sets:3,rest_seconds:120},advance:null,
   note:'마지막 단계예요. 같은 방법으로 한 기록을 비교하며 조금씩 늘려요.',
   prepare_check:'머리 위에 부딪힐 것이 없는지 확인해요.',
   cues:[],
   stop:['횟수를 채우려고 반동을 쓰기 시작하면 그 세트는 여기까지 해요.'],
   basis:[{item:'3회',kind:'ours',src:null},{item:'3세트',kind:'within',src:'acsm2009'},{item:'2분 쉬기',kind:'within',src:'acsm2009'}]}
 ];
 const program={
  version:'2026-10-24',
  addons:{band:{product_no:155,url:'https://fitablekorea.com/product/detail.html?product_no=155&utm_source=fitable_routine&utm_medium=web&utm_campaign=band_addon',level_ids:['feet_assist','slow_lower'],title:'밴드로 도움받을 수도 있어요',body:'와이드 풀업바 전용 풀업 밴드(별매)를 걸면 다리 대신 밴드가 몸을 받쳐 줘요.',link:'밴드 보기'}},
  disclaimer:'공개 자료를 바탕으로 만든 시작 안내예요. 개인 처방이 아니에요.',
  frequency:{text:'주 2~3회 · 연달아 하지 말고 하루 이상 쉬어요',basis:[{item:'주 2회 이상',kind:'source',src:'who'},{item:'주 2~3회',kind:'source',src:'acsm2009'},{item:'하루 이상 쉬기',kind:'ours',src:null}]},
  advance_rule:'같은 조건(동작·손 방향·도움)으로 2번 연속, 모든 세트를 목표만큼 해내면 다음 단계를 열어요. ‘어려움’을 고르거나 불편함을 표시한 운동은 세지 않아요.',
  advance_basis:[{item:'지금 운동량을 넘게 해낼 때 올리기',kind:'source',src:'acsm2009'},{item:'2번 연속',kind:'ours',src:null},{item:'끝까지 지칠 때까지 하지 않기',kind:'source',src:'acsm2026'},{item:'‘어려움’은 세지 않기',kind:'ours',src:'usmc_guide'}],
  common_stop:['아프거나 몸이 안 좋아지면 바로 멈춰요.','바 아래 바닥에 물건을 두지 않아요. 발을 내릴 때 걸리거나 헛디딜 수 있어요.','운동하는 동안 생기는 통증은 멈추라는 신호예요.','철봉이 움직이거나 소리가 나면 멈추고 설치 상태를 확인해요.','다음 날 근육이 1~3일 뻐근한 것은 흔해요. 어깨·팔꿈치가 계속 아프면 쉬거나 양을 줄이고, 필요하면 진료를 받아요.'],
  common_stop_basis:[{item:'아프면 바로 멈추기',kind:'source',src:'nhs'},{item:'운동 중 통증=멈춤 신호 · 1~3일 근육통',kind:'source',src:'acsm_doms'},{item:'계속 아프면 쉬고 줄이기',kind:'source',src:'usmc_guide'},{item:'바 아래 바닥 비우기',kind:'ours',src:null},{item:'철봉 설치 확인',kind:'ours',src:null}],
  banned:['반동(키핑)','점프해서 올라가기','떨어지듯 내리기','밴드 자동 추천'],
  sources,levels
 };
 function freeze(value){if(value&&typeof value==='object'){Object.values(value).forEach(freeze);Object.freeze(value);}return value;}
 freeze(program);
 if(typeof module!=='undefined'&&module.exports)module.exports=program;
 root.FitableLevels=program;
})(typeof globalThis!=='undefined'?globalThis:this);
