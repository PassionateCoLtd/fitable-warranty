'use strict';
(function (root) {
  const catalog = {
    hang: {
      name: '매달리기',
      shortName: '매달리기',
      steps: [
        { title: '발을 딛고 바를 잡아요', text: '안정적인 발판에서 바를 잡고, 준비가 되면 발을 천천히 떼요.' },
        { title: '흔들리지 않고 버텨요', text: '팔을 편 채 편안한 만큼 머물러요. 마칠 때는 발판에 발을 다시 디뎌요.' }
      ],
      cue: '뛰어오르거나 갑자기 떨어지지 않아요.'
    },
    scapular_pull: {
      name: '어깨 내리기',
      shortName: '어깨 내리기',
      steps: [
        { title: '팔을 펴고 매달려요', text: '매달리기가 편안할 때 시도해요. 발판에서 발을 천천히 떼요.' },
        { title: '어깨만 아래로 살짝', text: '팔꿈치는 계속 펴요. 어깨를 귀에서 멀어지게 당겼다가 천천히 돌아와요.' }
      ],
      cue: '몸은 아주 조금만 올라와요. 팔꿈치를 굽혀 당기는 동작과 달라요.'
    },
    pullup: {
      name: '턱걸이',
      shortName: '턱걸이',
      steps: [
        { title: '팔을 펴고 시작해요', text: '발판에서 바를 잡고 발을 천천히 떼요. 몸을 흔들지 않아요.' },
        { title: '몸을 당겼다가 내려와요', text: '팔꿈치를 굽혀 가능한 범위까지 올라가요. 턱을 억지로 내밀지 않고 천천히 내려와요.' }
      ],
      cue: '그림은 위쪽 자세의 예시예요. 그림 높이까지 올라가지 않아도 괜찮아요.'
    },
    band_pullup: {
      name: '밴드 도움 받아 턱걸이',
      shortName: '밴드 도움 턱걸이',
      steps: [
        { title: '먼저 호환 조건을 확인해요', text: '제품 설명서에서 밴드 사용이 허용되는지, 어떤 방법을 쓰는지 먼저 확인해요.' },
        { title: '도움을 받으며 천천히', text: '설명서의 사용 조건을 충족할 때만 시도해요. 반동 없이 몸을 당겼다가 내려와요.' }
      ],
      cue: '밴드 장착법은 이 그림에 표시하지 않았어요. 설명서와 다른 방식으로 연결하지 마세요.'
    }
  };
  function escape(value) { return String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch])); }
  function head(y) {
    return `<circle cx="90" cy="${y}" r="11" class="fv-skin"/><path d="M 80 ${y - 4} Q 89 ${y - 17} 100 ${y - 4}" class="fv-hair"/><path d="M 85 ${y + 3} Q 90 ${y + 7} 95 ${y + 3}" class="fv-face"/>`;
  }
  function lowerBody(top, feetOnStep) {
    const hip = top + 43, knee = hip + 34, foot = hip + 72;
    return `<path d="M 79 ${hip} L 77 ${knee} L 74 ${foot} M 101 ${hip} L 103 ${knee} L 106 ${foot}" class="fv-legs"/><path d="M 74 ${foot} L 64 ${foot + 3} M 106 ${foot} L 116 ${foot + 3}" class="fv-shoes"/>${feetOnStep ? `<rect x="52" y="${foot + 4}" width="76" height="14" rx="3" class="fv-step"/><path d="M 57 ${foot + 18} V ${foot + 30} M 123 ${foot + 18} V ${foot + 30}" class="fv-step-legs"/>` : ''}`;
  }
  function body(top, pose, feetOnStep) {
    const arms = pose === 'pull' ? `M 76 ${top + 8} L 35 87 L 48 50 M 104 ${top + 8} L 145 87 L 132 50` : `M 76 ${top} L 48 50 M 104 ${top} L 132 50`;
    const torso = `<path d="M 76 ${top} Q 90 ${top - 4} 104 ${top} L 102 ${top + 35} Q 90 ${top + 43} 78 ${top + 35} Z" class="fv-shirt"/><path d="M 79 ${top + 35} H 101 L 102 ${top + 45} H 78 Z" class="fv-shorts"/>`;
    return `<g class="fv-person">${lowerBody(top, feetOnStep)}${torso}<path d="M 90 ${top - 9} V ${top}" class="fv-neck"/><path d="${arms}" class="fv-arms"/><path d="M 48 48 V 54 M 132 48 V 54" class="fv-hands"/>${head(top - 20)}</g>`;
  }
  function bar() {
    return '<rect x="13" y="32" width="7" height="43" rx="2" class="fv-door"/><rect x="160" y="32" width="7" height="43" rx="2" class="fv-door"/><path d="M19 50H161" class="fv-bar"/>';
  }
  function arrow(x, y1, y2, small) {
    const h = y2 < y1 ? 6 : -6;
    return `<path d="M ${x} ${y1} V ${y2} M ${x - 5} ${y2 + h} L ${x} ${y2} L ${x + 5} ${y2 + h}" class="fv-arrow${small ? ' fv-arrow-small' : ''}"/>`;
  }
  function diagram(id, step) {
    let person = '', annotation = '';
    if (id === 'hang') {
      person = body(119, 'straight', !step);
      annotation = step ? '<path d="M73 234H107" class="fv-clearance"/><path d="M135 120V174" class="fv-steady"/>' : '<path d="M30 242H150" class="fv-floor"/>';
    } else if (id === 'scapular_pull') {
      person = body(step ? 112 : 119, 'straight', false);
      annotation = step ? '<path d="M74 116Q81 128 85 116M95 116Q99 128 106 116" class="fv-shoulder"/>' + arrow(35, 103, 123, true) + arrow(145, 103, 123, true) : '';
    } else {
      person = body(step ? 57 : 119, step ? 'pull' : 'straight', false);
      annotation = step ? arrow(27, 174, 116, false) : '';
      if (id === 'band_pullup') {
        // A separate symbol explains assistance without suggesting an unverified attachment.
        annotation += '<g class="fv-band-symbol"><rect x="121" y="178" width="44" height="61" rx="12" class="fv-band-card"/><path d="M137 194Q130 199 137 213Q143 223 150 213Q157 199 150 194Q143 186 137 194Z" class="fv-band"/><path d="M132 229H154" class="fv-band-line"/></g>';
      }
    }
    return `<svg class="fv-diagram" viewBox="0 0 180 282" role="img" aria-label="${escape(catalog[id].steps[step].title)}"><rect x="1" y="1" width="178" height="280" rx="17" class="fv-backdrop"/>${bar()}${person}${annotation}<path d="M31 264H149" class="fv-ground"/>${id === 'band_pullup' ? '<text x="143" y="252" text-anchor="middle" class="fv-svg-note">호환 확인</text>' : ''}</svg>`;
  }
  function render(id, options) {
    if (!Object.prototype.hasOwnProperty.call(catalog, id)) return '';
    const item = catalog[id];
    options = options || {};
    const step = Number(options.step) === 1 ? 1 : 0;
    if (options.compact) {
      return `<figure class="exercise-visual fv-compact" data-exercise-visual="${id}" data-visual-step="${step}" aria-label="${escape(item.name)} 동작 그림">${diagram(id, id === 'hang' ? 1 : step)}<figcaption class="fv-sr-only">${escape(item.shortName)} 동작 그림</figcaption></figure>`;
    }
    return `<figure class="exercise-visual" data-exercise-visual="${id}" data-visual-step="${step}" aria-label="${escape(item.name)} 준비와 동작 설명 그림"><div class="fv-sequence">${item.steps.map((part, index) => `<div class="fv-panel${index === step ? ' fv-active' : ''}" data-visual-frame="${index}">${diagram(id, index)}<div class="fv-step-label"><span>${index + 1}</span><strong>${escape(part.title)}</strong></div><p class="fv-step-text">${escape(part.text)}</p></div>`).join('')}</div><figcaption><span class="fv-caption-label">그림으로 보는 동작</span>${escape(item.cue)}</figcaption></figure>`;
  }
  const api = { render, catalog };
  root.FitableVisuals = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
