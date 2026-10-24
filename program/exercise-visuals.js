'use strict';
(function (root) {
  const catalog = {
    hang: {
      name: '매달리기',
      shortName: '매달리기',
      steps: [
        { title: '바닥에 서서 바를 잡아요', text: '바 아래 바닥에 서서 두 손으로 바를 잡아요. 점프해서 잡지 않아요.' },
        { title: '무릎을 굽혀 발을 띄워요', text: '팔을 편 채 편안한 만큼 버텨요. 끝낼 때는 발을 바닥에 천천히 내려요.' }
      ],
      cue: '뛰어오르거나 갑자기 떨어지지 않아요.'
    },
    scapular_pull: {
      name: '어깨 내리기',
      shortName: '어깨 내리기',
      steps: [
        { title: '바닥에 서서 바를 잡아요', text: '매달리기가 편안할 때 시도해요. 바 아래 바닥에 서서 두 손으로 바를 잡아요.' },
        { title: '어깨만 아래로 살짝', text: '무릎을 굽혀 발을 띄우고, 팔꿈치는 편 채 어깨를 귀에서 멀어지게 당겼다가 돌아와요. 끝나면 발을 바닥에 천천히 내려요.' }
      ],
      cue: '몸은 아주 조금만 올라와요. 팔꿈치를 굽혀 당기는 동작과 달라요.'
    },
    pullup: {
      name: '턱걸이',
      shortName: '턱걸이',
      steps: [
        { title: '무릎을 굽혀 매달려요', text: '바를 잡고 무릎을 굽혀 발을 띄워요. 팔을 편 채 몸을 흔들지 않아요.' },
        { title: '몸을 당겼다가 내려와요', text: '팔꿈치를 굽혀 가능한 범위까지 올라가요. 턱을 억지로 내밀지 않고 천천히 내려와요.' }
      ],
      cue: '그림은 턱이 바 위로 올라간 자세예요. 그림 높이까지 올라가지 않아도 괜찮아요.'
    },
    // 4단계(턱걸이 · 발 도움)에서 쓰는 그림. render('pullup', { assist: 'feet' }) 로 부른다.
    pullup_feet: {
      name: '발 디딤 턱걸이',
      shortName: '발 디딤 턱걸이',
      steps: [
        { title: '바닥에 서서 바를 잡아요', text: '발끝은 바닥에 댄 채 두 손으로 바를 잡아요.' },
        { title: '다리로 조금 밀며 당겨요', text: '발끝을 바닥에 댄 채 팔로 당겨 올라갔다가 천천히 내려와요. 뛰지 않아요.' }
      ],
      cue: '다리 힘은 필요한 만큼만 써요. 발끝이 바닥에서 떨어지지 않는 만큼만 올라가요.'
    },
    negative_pullup: {
      name: '천천히 내려오기',
      shortName: '천천히 내려오기',
      steps: [
        { title: '갈 수 있는 곳까지 올라가요', text: '바닥에서 다리로 밀며 팔로 당겨 올라가요. 점프하지 않아요.' },
        { title: '3~5초 천천히 내려와요', text: '팔을 천천히 펴며 내려와요. 팔이 다 펴지면 발을 바닥에 천천히 내려요.' }
      ],
      cue: '그림은 턱이 바 위로 올라간 자세예요. 그림 높이까지 올라가지 않아도 괜찮아요.'
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

  // Back view, one fixed camera for every frame. 1 cm = 1.15 SVG units.
  // Product ratios follow OPB01 photos: 80 cm door opening, 5.7 x 11.4 cm end blocks,
  // 38 mm rubber grips, 18 cm centre U-handle. Body: 160 cm woman standing on the floor (no step).
  // Bar height (docs/program/INSTALL_HEIGHT.md): the bar sits in the door frame at about 2 m, so a
  // 160 cm woman reaches it standing; to hang she bends her knees and lifts her feet.
  const K = 1.15, CX = 90, FLOOR = 276.8, FOOT = FLOOR, DOOR = 40, CASING = 7, TUBE_R = 1.9;
  const UPPER = 30, FORE = 23.5, HAND = 8.5, GRIP_X = 28, SH_X = 15.8, SH_H = 129, LIFT = 8, CHIN = 138;
  const REACH = Math.sqrt((UPPER + FORE + HAND) ** 2 - (GRIP_X - SH_X) ** 2);
  const KNUCKLE = SH_H + LIFT + REACH; // standing on the floor, straight arms, shoulders lifted by the reach (~198 cm)
  const BAR = KNUCKLE - 0.5; // bar centre ~197 cm, top of the 38 mm tube ~199 cm
  const KNEE = 44.5, ANKLE = 11.4, TUCK = 70 * Math.PI / 180; // knees bent 70 deg, lower legs toward the camera
  const SHIN = (KNEE - ANKLE) * Math.cos(TUCK);
  const straightLift = e => KNUCKLE - REACH - (SH_H + LIFT * e);
  const POSES = {
    stand: { ty: 0, e: 1, feet: 'down' },
    hang: { ty: straightLift(0.15), e: 0.15, feet: 'tucked' },
    active: { ty: straightLift(0), e: 0, feet: 'tucked' },
    toes: { ty: 11, e: 0, feet: 'toes', ik: true }, // heels up about 11 cm, toes stay on the floor
    top: { ty: BAR + 2 - CHIN, e: 0, feet: 'tucked', elbow: [31, 22] }, // chin just over the bar
    lower: { ty: BAR - 16 - CHIN, e: 0, feet: 'tucked', elbow: [37, 6] } // on the way down
  };
  const FRAMES = {
    hang: [{ pose: 'stand', ban: 'jump' }, { pose: 'hang', ban: 'swing' }],
    scapular_pull: [{ pose: 'stand', ban: 'jump' }, { pose: 'active', cue: 'down' }],
    pullup: [{ pose: 'hang', ban: 'jump' }, { pose: 'top', ban: 'swing', cue: 'up' }],
    pullup_feet: [{ pose: 'stand', ban: 'jump' }, { pose: 'toes', cue: 'up' }],
    negative_pullup: [{ pose: 'top', ban: 'jump' }, { pose: 'lower', cue: 'lower' }]
  };
  FRAMES.band_pullup = FRAMES.pullup;
  const VARIANTS = { 'pullup:feet': 'pullup_feet' };

  // Non-finite values are written as "NaN" on purpose so the path check fails loudly.
  const num = v => { const r = Math.round(v * 10) / 10; return Number.isFinite(r) ? String(r === 0 ? 0 : r) : 'NaN'; };
  const d = parts => parts.map(p => typeof p === 'number' ? num(p) : p).join(' ');
  const sx = x => CX + K * x;
  const sy = h => FOOT - K * h;
  const shape = (path, cls) => `<path d="${path}" class="${cls}"/>`;
  // Smooth closed/open outline through points; a truthy third value keeps a sharp corner.
  function curve(pts, closed) {
    const n = pts.length, at = i => pts[closed ? (i + n) % n : Math.min(n - 1, Math.max(0, i))];
    const out = ['M', pts[0][0], pts[0][1]];
    for (let i = 0; i < (closed ? n : n - 1); i++) {
      const a = at(i - 1), b = at(i), c = at(i + 1), e = at(i + 2), kb = b[2] ? 0 : 1 / 6, kc = c[2] ? 0 : 1 / 6;
      out.push('C', b[0] + (c[0] - a[0]) * kb, b[1] + (c[1] - a[1]) * kb, c[0] - (e[0] - b[0]) * kc, c[1] - (e[1] - b[1]) * kc, c[0], c[1]);
    }
    if (closed) out.push('Z');
    return d(out);
  }
  const toSvg = (pts, ox, ty) => pts.map(p => [sx(p[0] + ox), sy(p[1] + ty), p[2]]);
  // Symmetric outline from a right half drawn top-centre to bottom-centre (body cm).
  function mirrored(half, ty, ox) {
    ox = ox || 0;
    const left = half.slice(1, -1).reverse().map(p => [-p[0], p[1], p[2]]);
    return curve(toSvg(half.concat(left), ox, ty), true);
  }
  const flip = (pts, side) => pts.map(p => [p[0] * side, p[1], p[2]]);
  // Walks a joint chain; at a joint the bisector direction keeps bends round.
  function sampler(chain) {
    const lens = [];
    let total = 0;
    for (let i = 1; i < chain.length; i++) { const l = Math.hypot(chain[i][0] - chain[i - 1][0], chain[i][1] - chain[i - 1][1]); lens.push(l); total += l; }
    return t => {
      let s = t * total;
      for (let i = 0; i < lens.length; i++) {
        if (s <= lens[i] + 1e-9 || i === lens.length - 1) {
          const a = chain[i], b = chain[i + 1];
          let dx = (b[0] - a[0]) / lens[i], dy = (b[1] - a[1]) / lens[i];
          if (Math.abs(s - lens[i]) < 1e-6 && i < lens.length - 1) {
            const c = chain[i + 2], nx = dx + (c[0] - b[0]) / lens[i + 1], ny = dy + (c[1] - b[1]) / lens[i + 1], nl = Math.hypot(nx, ny) || 1;
            dx = nx / nl; dy = ny / nl;
          }
          return [a[0] + (b[0] - a[0]) / lens[i] * s, a[1] + (b[1] - a[1]) / lens[i] * s, dx, dy];
        }
        s -= lens[i];
      }
    };
  }
  // Tapered limb along a joint chain; width changes gradually so joints stay soft.
  function limb(chain, profile, capStart, capEnd) {
    const sample = sampler(chain), L = [], R = [];
    profile.forEach(([t, w]) => { const [x, y, dx, dy] = sample(t); L.push([x - dy * w / 2, y + dx * w / 2]); R.push([x + dy * w / 2, y - dx * w / 2]); });
    const f = sample(0), l = sample(1), w0 = profile[0][1], w1 = profile[profile.length - 1][1];
    const pts = L.concat([[l[0] + l[2] * w1 * capEnd, l[1] + l[3] * w1 * capEnd]], R.reverse(), [[f[0] - f[2] * w0 * capStart, f[1] - f[3] * w0 * capStart]]);
    return curve(pts.map(p => [sx(p[0]), sy(p[1])]), true);
  }
  // Soft shadow along one edge of a limb: entries are [t, limb width, shadow width].
  function edgeShade(chain, profile, side) {
    const sample = sampler(chain), O = [], I = [];
    profile.forEach(([t, w, sw]) => { const [x, y, dx, dy] = sample(t), nx = -dy * side, ny = dx * side; O.push([x + nx * w / 2, y + ny * w / 2, 0]); I.push([x + nx * (w / 2 - sw), y + ny * (w / 2 - sw), 0]); });
    return curve(O.concat(I.reverse()).map(p => [sx(p[0]), sy(p[1])]), true);
  }

  function scene() {
    const dl = sx(-DOOR), dr = sx(DOOR), cl = sx(-DOOR - CASING), cr = sx(DOOR + CASING);
    const top = 2;
    const door = shape(d(['M', cl, top, 'H', cr, 'V', FLOOR, 'H', cl, 'Z']), 'fv-casing') +
      shape(d(['M', dl, top, 'H', dr, 'V', FLOOR, 'H', dl, 'Z']), 'fv-opening') +
      shape(d(['M', dl + 0.6, top, 'V', FLOOR, 'M', dr - 0.6, top, 'V', FLOOR]), 'fv-jamb') +
      shape(d(['M', 9, FLOOR, 'H', 171]), 'fv-floor');
    return `<rect x="1" y="1" width="178" height="280" rx="17" class="fv-backdrop"/><g class="fv-scene">${door}${bar()}</g>`;
  }
  function bar() {
    const y = sy(BAR), r = TUBE_R * K, tube = 1.35 * K, blockW = 5.7 * K, blockH = 11.4 * K;
    const ends = [-1, 1].map(side => {
      const outer = sx(side * DOOR), inner = sx(side * (DOOR - 5.7)), x = Math.min(outer, inner);
      const pad = side < 0 ? [x, x + 1.1 * K] : [x + blockW - 1.1 * K, x + blockW];
      const grip = side < 0 ? [inner, sx(-DOOR + 5.7 + 24)] : [sx(DOOR - 5.7 - 24), inner];
      return `<rect x="${num(grip[0])}" y="${num(y - r)}" width="${num(grip[1] - grip[0])}" height="${num(r * 2)}" rx="${num(r * 0.5)}" class="fv-grip"/>` +
        `<rect x="${num(x)}" y="${num(y - blockH / 2)}" width="${num(blockW)}" height="${num(blockH)}" rx="${num(1.9 * K)}" class="fv-block"/>` +
        `<rect x="${num(pad[0])}" y="${num(y - blockH / 2 + 1)}" width="${num(pad[1] - pad[0])}" height="${num(blockH - 2)}" rx="0.6" class="fv-pad"/>` +
        `<rect x="${num(x + blockW / 2 - 1)}" y="${num(y + 1.8 * K)}" width="2" height="1.1" rx="0.5" class="fv-level"/>`;
    }).join('');
    const hx = 9 * K, hTop = y - r - 6.5 * K, hr = 2.2 * K;
    const handle = d(['M', CX - hx, y - r * 0.4, 'V', hTop + hr, 'Q', CX - hx, hTop, CX - hx + hr, hTop, 'H', CX + hx - hr, 'Q', CX + hx, hTop, CX + hx, hTop + hr, 'V', y - r * 0.4]);
    const ribs = [-4.5, -1.5, 1.5, 4.5].map(o => d(['M', sx(o - 1), y + r * 0.85, 'L', sx(o + 1), y - r * 0.85])).join(' ');
    return shape(d(['M', sx(-DOOR + 5), y, 'H', sx(DOOR - 5)]), 'fv-tube-edge') + shape(d(['M', sx(-DOOR + 5), y, 'H', sx(DOOR - 5)]), 'fv-tube') +
      shape(handle, 'fv-handle-edge') + shape(handle, 'fv-handle') +
      shape(d(['M', CX - hx, y + r, 'V', y + r + 2.4, 'M', CX - hx - 1.1, y + r + 2.4, 'H', CX - hx + 1.1, 'M', CX + hx, y + r, 'V', y + r + 2.4, 'M', CX + hx - 1.1, y + r + 2.4, 'H', CX + hx + 1.1]), 'fv-hook') +
      `<rect x="${num(sx(-6.5))}" y="${num(y - r * 1.03)}" width="${num(13 * K)}" height="${num(r * 2.06)}" rx="${num(r)}" class="fv-centre"/>` + shape(ribs, 'fv-rib') + ends;
  }

  function arm(pose, side) {
    const ty = pose.ty, J = [SH_X, SH_H + LIFT * pose.e + ty], Kn = [GRIP_X, KNUCKLE];
    let E, W;
    const len = Math.hypot(Kn[0] - J[0], Kn[1] - J[1]), reach = UPPER + FORE + HAND;
    if (pose.ik && len < reach) {
      // Slight bend: elbow out to the side, full bone lengths (two-circle intersection).
      const lo = FORE + HAND, a = (UPPER * UPPER - lo * lo + len * len) / (2 * len), h = Math.sqrt(Math.max(0, UPPER * UPPER - a * a));
      const ux = (Kn[0] - J[0]) / len, uy = (Kn[1] - J[1]) / len;
      E = [J[0] + ux * a + uy * h, J[1] + uy * a - ux * h];
      const fl = Math.hypot(Kn[0] - E[0], Kn[1] - E[1]);
      W = [Kn[0] - (Kn[0] - E[0]) / fl * HAND, Kn[1] - (Kn[1] - E[1]) / fl * HAND];
    } else if (pose.elbow) {
      E = [pose.elbow[0], J[1] - pose.elbow[1]];
      const fl = Math.hypot(Kn[0] - E[0], Kn[1] - E[1]);
      W = [Kn[0] - (Kn[0] - E[0]) / fl * HAND, Kn[1] - (Kn[1] - E[1]) / fl * HAND];
    } else {
      const len = Math.hypot(Kn[0] - J[0], Kn[1] - J[1]), ux = (Kn[0] - J[0]) / len, uy = (Kn[1] - J[1]) / len;
      E = [J[0] + ux * UPPER, J[1] + uy * UPPER];
      W = [J[0] + ux * (UPPER + FORE), J[1] + uy * (UPPER + FORE)];
    }
    const up = Math.hypot(E[0] - J[0], E[1] - J[1]), fo = Math.hypot(W[0] - E[0], W[1] - E[1]), te = up / (up + fo);
    const m = p => [p[0] * side, p[1]];
    const profile = [[0, pose.elbow ? 8.8 : 10.4], [te * 0.2, pose.elbow ? 9.0 : 9.5], [te * 0.55, 8.0], [te * 0.88, 6.8], [te, 6.4], [te + (1 - te) * 0.22, 7.0], [te + (1 - te) * 0.62, 5.8], [1, 4.8]];
    const shade = [[te * 0.12, 9.6, 0.2], [te * 0.4, 8.4, 1.9], [te * 0.75, 7.2, 1.5], [te * 1.02, 6.4, 0.2]];
    return { path: limb([m(J), m(E), m(W)], profile, pose.elbow ? 0.3 : 0.36, 0.05), shade: edgeShade([m(J), m(E), m(W)], shade, side), W, Kn };
  }
  function hand(a, side) {
    const [wx, wy] = a.W, k = a.Kn, len = Math.hypot(k[0] - wx, k[1] - wy), ux = (k[0] - wx) / len, uy = (k[1] - wy) / len;
    const P = (s, b) => [wx + ux * s + uy * b, wy + uy * s - ux * b];
    const pts = [P(0, 2.45), P(4.6, 3.45), [k[0] + 4.0, BAR + 0.3], [k[0] + 3.7, BAR + 2.6], [k[0] + 1.4, BAR + 3.5], [k[0] - 1.2, BAR + 3.6], [k[0] - 3.4, BAR + 2.8], [k[0] - 4.1, BAR + 0.4], [k[0] - 4.8, BAR - 1.5], [k[0] - 4.1, BAR - 3.2], P(4.1, -3.1), P(0, -2.45)];
    const fingers = [-1.9, 0.1, 2.0].map(o => d(['M', sx(side * (k[0] + o)), sy(BAR + 0.7), 'L', sx(side * (k[0] + o)), sy(BAR + 3.1)])).join(' ');
    return shape(curve(flip(pts, side).map(p => [sx(p[0]), sy(p[1])]), true), 'fv-skin') + shape(fingers, 'fv-crease');
  }
  function shoe(side, pose) {
    const x = 8.1 * side, ty = pose.ty;
    if (pose.feet === 'tucked') {
      // Knees bent: the lower legs point at the camera, so the soles face us and the toes hang down.
      const a = ty + KNEE - SHIN;
      const upper = [[0, a + 3.6], [3.1, a + 3.2], [4.1, a + 0.4], [4.6, a - 6], [4.7, a - 12], [4.0, a - 16.3], [2.3, a - 17.8], [0, a - 18.1]];
      const sole = [[0, a + 2.5], [2.5, a + 2.2], [3.3, a + 0.1], [3.8, a - 6], [3.9, a - 12], [3.3, a - 15.6], [1.9, a - 16.8], [0, a - 17]];
      const tread = [a - 1.2, a - 5.5, a - 9.5, a - 13.5].map(h => d(['M', sx(x - 2.4), sy(h), 'H', sx(x + 2.4)])).join(' ');
      return shape(mirrored(upper, 0, x), 'fv-shoe') + shape(mirrored(sole, 0, x), 'fv-sole') + shape(tread, 'fv-tread');
    }
    const heel = [[0, 10.3], [3.0, 10.0], [3.55, 6.6], [3.85, 2.6], [3.8, 1.3], [0, 1.1]];
    const sole = [[0, 1.7], [3.95, 1.7, 1], [3.95, 0.4], [3.5, -0.15], [0, -0.2]];
    // On tiptoe the raised heel shows the underside of the sole down to the toes on the floor.
    const under = [[0, ty + 1.4], [3.3, ty + 1.3], [3.6, ty * 0.6], [4.2, 1.4], [4.1, 0.1], [3.5, -0.2], [0, -0.3]];
    const toes = pose.feet === 'toes' ? shape(mirrored(under, 0, x), 'fv-sole') + shape([ty * 0.62, ty * 0.3].map(h => d(['M', sx(x - 2.6), sy(h), 'H', sx(x + 2.6)])).join(' '), 'fv-tread') : '';
    return toes + shape(mirrored(heel, ty, x), 'fv-shoe') + shape(mirrored(sole, ty, x), 'fv-sole') +
      `<rect x="${num(sx(x - 0.8))}" y="${num(sy(ty + 12.1))}" width="${num(1.6 * K)}" height="${num(2.3 * K)}" rx="0.6" class="fv-tab"/>`;
  }
  function person(pose) {
    const ty = pose.ty, e = pose.e;
    const off = pose.feet === 'tucked';
    const shadow = ['-1', '1'].map(s => `<ellipse cx="${num(sx(8.1 * s))}" cy="${num(sy(0) + 0.4)}" rx="${off ? 3.6 : pose.feet === 'toes' ? 3.9 : 4.8}" ry="${off ? 0.9 : 1.2}" class="fv-contact${off ? ' fv-contact-soft' : ''}"/>`).join('');
    // Legs (7/8 leggings), ankles, shoes. Bent knees shorten the lower leg in this back view.
    const thigh = 88 - KNEE, shin = off ? SHIN : KNEE - ANKLE, full = thigh + KNEE - ANKLE;
    const at = t => { const s = t * full; return (s <= thigh ? s : thigh + (s - thigh) * shin / (KNEE - ANKLE)) / (thigh + shin); };
    const legProfile = [[0, 15.8], [0.08, 16.4], [0.19, 15.2], [0.31, 13.3], [0.43, 11.5], [0.53, 9.9], [0.565, 9.4], [0.64, 10.1], [0.72, 10.6], [0.83, 8.6], [0.94, 6.8], [1, 6.1]].map(([t, w]) => [at(t), w]);
    const legs = [-1, 1].map(s => limb([[8.7 * s, 88 + ty], [8.4 * s, KNEE + ty], [8.1 * s, KNEE - shin + ty]], legProfile, 0, 0.12)).join(' ');
    const ankles = off ? '' : [-1, 1].map(s => limb([[8.1 * s, 14 + ty], [8.1 * s, 7 + ty]], [[0, 5.4], [1, 5.6]], 0, 0.2)).join(' ');
    const pelvis = mirrored([[0, 101.8, 1], [12.6, 101.8], [15.4, 94], [16.9, 86], [16.8, 80], [9.5, 73.6], [0, 74.6, 1]], ty);
    const legLines = d(['M', sx(0), sy(93 + ty), 'V', sy(78 + ty)]) + ' ' + [-1, 1].map(s => curve(toSvg(flip([[6.6, 45.0], [8.4, 44.6], [10.2, 45.0]], s), 0, ty), false)).join(' ');
    // Upper body: skin silhouette, racerback tank, shoulder blades.
    const trapN = 135.8 + 4.5 * e, trapM = 134.4 + 6.5 * e, acro = 131.2 + 8 * e;
    const onTrap = x => x <= 10.8 ? trapN + (trapM - trapN) * (x - 5.3) / 5.5 : trapM + (acro - trapM) * (x - 10.8) / 5.8;
    const torso = mirrored([[0, 146], [4.6, 145.6], [4.8, Math.min(143.6, trapN + 2)], [5.4, trapN], [10.8, trapM], [16.6, acro], [20.4, SH_H + LIFT * e - 2], [18.0, SH_H + LIFT * e - 9], [16.3, 111.5], [13.0, 103], [12.6, 99.5], [0, 99.5, 1]], ty);
    const tank = mirrored([[0, 127.6 + 3 * e, 1], [5.9, onTrap(5.9) - 0.35, 1], [9.7, onTrap(9.7) - 0.35, 1], [3.5, 122.6 + 2.5 * e], [3.4, 119.8 + 2 * e], [9.4, 118.0 + 1.5 * e], [16.6, 118.0 + 2 * e, 1], [16.6, 111.3], [13.2, 101.6], [15.7, 95.2], [15.5, 93.4, 1], [0, 92.9, 1]], ty);
    const blades = [-1, 1].map(s => curve(toSvg(flip([[7.2, 128 + 6.5 * e], [7.0, 122.5 + 6 * e], [11.0, 116.6 + 5 * e]], s), 0, ty), false)).join(' ');
    const tankShade = [-1, 1].map(s => mirroredHalf(s, ty)).join('');
    function mirroredHalf(s, t) { return shape(curve(toSvg(flip([[13.6, 114.5], [15.9, 111], [12.9, 101.6], [13.8, 95], [11.6, 99], [12.3, 108]], s), 0, t), true), 'fv-top-shade'); }
    // Head from behind: hair in a bun, ears visible so the ear-to-shoulder gap reads.
    const ears = [-1, 1].map(s => `<ellipse cx="${num(sx(7.75 * s))}" cy="${num(sy(147.6 + ty))}" rx="${num(1.35 * K)}" ry="${num(2.8 * K)}" class="fv-skin"/>`).join('');
    const hair = mirrored([[0, 160.8], [5.0, 159.6], [7.4, 156.2], [8.0, 151.2], [7.5, 146.5], [6.2, 143.6], [4.6, 142.1], [2.0, 141.7], [0, 141.5]], ty);
    const hairShine = curve(toSvg([[-7.0, 149.2], [-6.3, 154.4], [-3.9, 158.2]], 0, ty), false);
    const hairLines = [-1, 1].map(s => curve(toSvg(flip([[4.6, 143.2], [4.6, 150.0], [2.4, 156.4]], s), 0, ty), false)).join(' ') + ' ' + d(['M', sx(0.6), sy(142.2 + ty), 'L', sx(0.3), sy(155.4 + ty)]);
    const bun = `<circle cx="${num(sx(0))}" cy="${num(sy(159.9 + ty))}" r="${num(3.9 * K)}" class="fv-bun"/>` + shape(curve(toSvg([[-2.4, 159.6], [0, 158.4], [2.3, 160.4], [0.4, 162.9]], 0, ty), false) + ' ' + d(['M', sx(-3.2), sy(157.2 + ty), 'Q', sx(0), sy(155.8 + ty), sx(3.2), sy(157.2 + ty)]), 'fv-hair-line');
    const arms = [-1, 1].map(s => arm(pose, s));
    return `<g class="fv-person">${shadow}${ankles ? shape(ankles, 'fv-skin') : ''}${shape(legs + ' ' + pelvis, 'fv-legs')}${shape(legLines, 'fv-legs-line')}` +
      [-1, 1].map(s => shoe(s, pose)).join('') +
      shape(torso, 'fv-skin') + `<ellipse cx="${num(sx(0))}" cy="${num(sy(141.4 + ty))}" rx="${num(4.4 * K)}" ry="${num(1.4 * K)}" class="fv-skin-shade"/>` +
      shape(blades, 'fv-blade') + shape(tank, 'fv-top') + tankShade +
      arms.map(a => shape(a.path, 'fv-skin') + shape(a.shade, 'fv-skin-shade')).join('') +
      ears + shape(hair, 'fv-hair') + shape(hairShine, 'fv-hair-shine') + shape(hairLines, 'fv-hair-line') + bun +
      arms.map((a, i) => hand(a, i ? 1 : -1)).join('') + '</g>';
  }

  function arrow(x1, y1, x2, y2) {
    const len = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / len, uy = (y2 - y1) / len, hx = x2 - ux * 4.4, hy = y2 - uy * 4.4, px = -uy * 2.8, py = ux * 2.8;
    const line = d(['M', x1, y1, 'L', hx, hy]), head = d(['M', x2, y2, 'L', hx + px, hy + py, 'L', hx - px, hy - py, 'Z']);
    return `<g class="fv-arrow">${shape(line + ' ' + head, 'fv-arrow-halo')}${shape(line, 'fv-arrow-line')}${shape(head, 'fv-arrow-head')}</g>`;
  }
  // Small prohibition icons: no jumping onto the bar, no swinging.
  function ban(kind) {
    const glyph = kind === 'jump'
      ? '<circle cx="0.4" cy="-5.4" r="1.6" class="fv-ban-dot"/>' + shape('M -2.9 -6.4 L 0.2 -3.2 L 3.3 -6.2 M 0.2 -3.2 V 0.8 L -2.4 2.6 L -1.4 4.6 M 0.2 0.8 L 2.6 2.8 L 1.8 4.8 M -4.6 7.4 H 4.6', 'fv-ban-glyph')
      : '<circle cx="0" cy="-3.6" r="1.5" class="fv-ban-dot"/>' + shape('M -5.2 -7 H 5.2 M -2.6 -7 L -0.5 -3 M 2.6 -7 L 0.5 -3 M 0 -2.2 L 1.5 3.6 M -5.6 1.4 Q 0 9 5.6 1.4', 'fv-ban-glyph');
    return `<g class="fv-ban" data-ban="${kind}" transform="translate(18.5 231) scale(1.12)"><circle r="10.2" class="fv-ban-ring"/>${glyph}${shape('M -7.2 -7.2 L 7.2 7.2', 'fv-ban-slash')}</g>`;
  }
  function annotate(frame, pose) {
    let out = '';
    if (frame.cue === 'down') out += [-1, 1].map(s => arrow(sx(11.2 * s), sy(128.4 + pose.ty), sx(11.2 * s), sy(119.2 + pose.ty))).join('');
    if (frame.cue === 'up') out += arrow(sx(-27), sy(80), sx(-27), sy(118));
    if (frame.cue === 'lower') out += arrow(sx(-27), sy(122), sx(-27), sy(84));
    if (frame.ban) out += ban(frame.ban);
    return out;
  }
  function bandCard() {
    return '<g class="fv-band-symbol"><rect x="147" y="196" width="28" height="44" rx="9" class="fv-band-card"/><path d="M 156 207 Q 151 212 156 224 Q 161 232 166 224 Q 171 212 166 207 Q 161 201 156 207 Z" class="fv-band"/><path d="M 153 233 H 169" class="fv-band-line"/><text x="161" y="252" text-anchor="middle" class="fv-svg-note">호환 확인</text></g>';
  }
  function diagram(id, step) {
    const frame = FRAMES[id][step], pose = POSES[frame.pose];
    return `<svg class="fv-diagram" viewBox="0 0 180 282" role="img" aria-label="${escape(catalog[id].steps[step].title)}" data-pose="${frame.pose}">${scene()}${person(pose)}<g class="fv-notes">${annotate(frame, pose)}</g>${id === 'band_pullup' ? bandCard() : ''}</svg>`;
  }
  function render(id, options) {
    const own = key => Object.prototype.hasOwnProperty.call(catalog, key);
    if (!own(id) || Object.values(VARIANTS).includes(id)) return ''; // variants are reached through options.assist only
    options = options || {};
    // Same exercise, different picture for a different way of doing it (4단계 발 디딤 턱걸이).
    const variant = Object.prototype.hasOwnProperty.call(VARIANTS, id + ':' + options.assist) ? VARIANTS[id + ':' + options.assist] : null;
    const key = variant || id, item = catalog[key];
    const attrs = `data-exercise-visual="${id}"${variant ? ` data-visual-variant="${escape(options.assist)}"` : ''}`;
    const step = Number(options.step) === 1 ? 1 : 0;
    if (options.compact) {
      return `<figure class="exercise-visual fv-compact" ${attrs} data-visual-step="${step}" aria-label="${escape(item.name)} 동작 그림">${diagram(key, key === 'hang' ? 1 : step)}<figcaption class="fv-sr-only">${escape(item.shortName)} 동작 그림</figcaption></figure>`;
    }
    return `<figure class="exercise-visual" ${attrs} data-visual-step="${step}" aria-label="${escape(item.name)} 준비와 동작 설명 그림"><div class="fv-sequence">${item.steps.map((part, index) => `<div class="fv-panel${index === step ? ' fv-active' : ''}" data-visual-frame="${index}">${diagram(key, index)}<div class="fv-step-label"><span>${index + 1}</span><strong>${escape(part.title)}</strong></div><p class="fv-step-text">${escape(part.text)}</p></div>`).join('')}</div><figcaption><span class="fv-caption-label">그림으로 보는 동작</span>${escape(item.cue)}</figcaption></figure>`;
  }
  // Bar and body numbers in cm, for tests and the height note (docs/program/INSTALL_HEIGHT.md).
  const geometry = Object.freeze({ barCm: BAR, barTopCm: BAR + TUBE_R, floorY: FLOOR, cmToSvg: K, standingGripCm: KNUCKLE, chinCm: CHIN, barY: sy(BAR) });
  const api = { render, catalog, geometry };
  root.FitableVisuals = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
