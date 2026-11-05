(() => {
if (!window.HL || typeof window.hairline !== 'function') return;
const {
  Cam, fit, proj, facing, rings, prism, rrect, poly, seg, lerp, reducedMotion, tween, tset, tval, tdone,
  mk, solid, put, place, pointer, register, disposer,
} = window.HL;

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let reach = value, active = -1, elapsed = 0;
  const C = Cam(45, .5, 1.5);
  fit(C, [[-84, -76, -5], [-84, 84, -5], [84, 84, -5], [84, -76, -5], [-50, 50, 77], [36, -63, 77], [-40, -40, 43]], 200, 166);
  const P = proj(C), front = facing(C);
  const offsets = [
    [52, 60.4, -90, .6],
    [-42, -47, -50, .8],
    [-13, 11.5, 0, .75],
    [9.5, -3.1, 0, .8],
  ];
  const projections = offsets.map(([dx, dy, dz, scale]) =>
    (x, y, z) => P(x * scale + dx, y * scale + dy, (z + dz) * scale));
  const board = solid(svg);
  const [boardRing, boardInner] = rings(-84, -76, 84, 84, 8, 1.5);
  put(board, prism(P, front, boardRing, boardInner, -5, -1));
  const links = Array.from({ length: 3 }, () => mk('path', { class: 'nf sil' }, svg));
  const packets = [0, 1].map(() => mk('circle', { r: 1.5, class: 'dot' }, svg));
  const groups = Array.from({ length: 4 }, () => mk('g', {}, svg));
  // Paint the cable ends over the switch face so the connections are visible.
  svg.insertBefore(groups[1], links[0]);
  const router = solid(groups[0]), antennas = [solid(groups[0]), solid(groups[0])];
  const routerVents = mk('path', { class: 'nf lo' }, groups[0]);
  const routerLights = [0, 1, 2].map(() => mk('circle', { r: .8, class: 'dot m' }, groups[0]));
  const sw = solid(groups[1]);
  const ports = Array.from({ length: 6 }, () => mk('path', { class: 'nf' }, groups[1]));
  const switchPort = i => [-24.5 + i * 10, 16.1, 54.25];
  const base = solid(groups[2]), stem = solid(groups[2]), monitor = solid(groups[2]);
  const screen = mk('path', { class: 'nf lo' }, groups[2]);
  const tower = solid(groups[2]);
  const towerVents = mk('path', { class: 'nf lo' }, groups[2]);
  const towerLight = mk('circle', { r: .9, class: 'dot m' }, groups[2]);
  const keyboard = solid(groups[2]), keys = mk('path', { class: 'nf lo' }, groups[2]);
  const server = solid(groups[3]);
  const bays = Array.from({ length: 3 }, () => mk('path', { class: 'nf' }, groups[3]));
  const indicators = bays.map(() => mk('circle', { r: .8, class: 'dot m' }, groups[3]));
  const serverVents = mk('path', { class: 'nf lo' }, groups[3]);
  const lifts = groups.map(() => tween(0)), drawn = groups.map(() => NaN);
  const names = ['router', 'switch', 'komputer', 'serwer'];
  const centres = [[0, 0, 103], [0, 0, 55], [-36, 49, 22], [50, -50, 32]].map((point, i) => projections[i](...point));
  const hitSizes = [[33, 23], [45, 20], [50, 36], [30, 42]];
  let curves = [];

  function block(P, part, x0, y0, x1, y1, radius, z0, z1, lift) {
    const [ring, inner] = rings(x0, y0, x1, y1, radius, Math.min(.7, radius / 2));
    put(part, prism(P, front, ring, inner, z0 + lift, z1 + lift));
  }
  function face(P, x0, z0, x1, z1, y, lift, radius = 1.2) {
    return poly(rrect(x0, z0, x1, z1, radius, 6).map(p => P(p.u, y, p.v + lift)));
  }
  function drawRouter(lift) {
    const P = projections[0];
    block(P, router, -30, -16, 30, 16, 5, 90, 101, lift);
    [-24, 21].forEach((x, i) => block(P, antennas[i], x, -12, x + 3, -9, 1.4, 101, 121, lift));
    routerVents.setAttribute('d', [-18, -10, -2, 6, 14].map(x => seg(P(x, -3, 101 + lift), P(x, 5, 101 + lift))).join(''));
    routerLights.forEach((dot, i) => place(dot, P(-10 + i * 9, 16, 95 + lift)));
  }
  function drawSwitch(lift) {
    const P = projections[1];
    block(P, sw, -35, -16, 35, 16, 3, 50, 59, lift);
    ports.forEach((port, i) => {
      const [x, y, z] = switchPort(i);
      port.setAttribute('d', face(P, x - 3.5, z - 2.25, x + 3.5, z + 2.25, y, lift, .7));
    });
  }
  function drawComputer(lift) {
    const P = projections[2];
    block(P, base, -61, 44, -39, 59, 3, 0, 3, lift);
    block(P, stem, -53, 46, -48, 50, 1.8, 3, 15, lift);
    block(P, monitor, -76, 42, -24, 47, 2, 13, 47, lift);
    screen.setAttribute('d', face(P, -72, 18, -28, 43, 47.1, lift, 1.8));
    block(P, tower, -14, 30, 2, 52, 2.5, 0, 37, lift);
    towerVents.setAttribute('d', [8, 12, 16].map(z => seg(P(-11, 52.1, z + lift), P(-1, 52.1, z + lift))).join(''));
    place(towerLight, P(-6, 52.1, 29 + lift));
    block(P, keyboard, -75, 64, -28, 78, 2.5, 0, 3, lift);
    keys.setAttribute('d', [68, 72, 75].map(y => seg(P(-71, y, 3 + lift), P(-32, y, 3 + lift))).join(''));
  }
  function drawServer(lift) {
    const P = projections[3];
    block(P, server, 36, -63, 65, -37, 3, 0, 65, lift);
    bays.forEach((bay, i) => {
      const z = 16 + i * 15;
      bay.setAttribute('d', face(P, 40, z, 61, z + 10, -36.9, lift));
      place(indicators[i], P(57, -36.8, z + 5 + lift));
    });
    serverVents.setAttribute('d', [42, 48, 54, 60].map(x => seg(P(x, -55, 65 + lift), P(x, -44, 65 + lift))).join(''));
  }
  const draw = [drawRouter, drawSwitch, drawComputer, drawServer];
  function drawLinks(z) {
    const port = (i, x, y, height) => projections[i](x, y, height + z[i]);
    const swPort = i => port(1, ...switchPort(i));
    const lead = ([x, y]) => [x - 7, y + 14];
    const pairs = [
      [port(0, -9, -16, 96), swPort(3)],
      [swPort(1), port(2, 2, 30, 30)],
      [swPort(5), port(3, 37, -37, 26)],
    ];
    curves = pairs.map(([a, b], i) => i === 0
      ? [a, [a[0], lerp(a[1], b[1], .55)], lead(b), b]
      : [a, lead(a), [b[0], lerp(a[1], b[1], .65)], b]);
    links.forEach((link, i) => link.setAttribute('d', `M${curves[i][0]} C${curves[i].slice(1).join(' ')}`));
  }
  function onCurve(points, t) {
    const weights = [(1 - t) ** 3, 3 * (1 - t) ** 2 * t, 3 * (1 - t) * t * t, t ** 3];
    return [0, 1].map(axis => weights.reduce((sum, weight, i) => sum + weight * points[i][axis], 0));
  }
  const loop = register(stage, (dt, now) => {
    const positions = lifts.map(t => tval(t, now));
    let changed = false;
    positions.forEach((lift, i) => {
      if (lift === drawn[i]) return;
      drawn[i] = lift; draw[i](lift); changed = true;
    });
    if (changed) drawLinks(positions);
    const stationary = reducedMotion();
    if (!stationary) elapsed += dt;
    packets.forEach((packet, i) => {
      const cycle = elapsed / 2.6 + (i + .5) / packets.length;
      const progress = (cycle % 1) * 2;
      const leg = Math.floor(progress), branch = Math.floor(cycle) % 2 ? 2 : 1;
      place(packet, onCurve(curves[leg === 0 ? 0 : branch], progress - leg));
    });
    return !stationary || lifts.some(t => !tdone(t, now));
  });
  bag.add(loop.unregister);
  function choose(next) {
    if (active === next) return;
    active = next;
    const now = performance.now();
    lifts.forEach((lift, i) => tset(lift, i === next ? reach : 0, now, 0));
    links.forEach((link, i) => link.classList.toggle('hi', next >= 0 && (i === 0 || (i === 1 && next === 2) || (i === 2 && next === 3))));
    read.textContent = next < 0 ? 'rest' : names[next];
    loop.wake();
  }
  // Picking uses fixed rest centres; a lifted device never moves out of its hit area.
  bag.add(pointer(stage, {
    move: ([x, y]) => {
      const scores = centres.map(([cx, cy], i) => ((x - cx) / hitSizes[i][0]) ** 2 + ((y - cy) / hitSizes[i][1]) ** 2);
      const nearest = scores.indexOf(Math.min(...scores));
      choose(scores[nearest] <= 1 ? nearest : -1);
    },
    leave: () => choose(-1),
  }));
  bag.add(() => svg.replaceChildren());
  read.textContent = 'rest';
  return { set: v => { reach = v; const last = active; active = -1; if (last >= 0) choose(last); loop.wake(); }, destroy: bag.dispose };
}

hairline({
  name: 'network',
  means: 'Four devices on a shared LAN board: router, switch, computer and server. Hover gently lifts the selected device.',
  rules: [1, 2, 4, 6, 7, 8, 9],
  range: [3, 6, 10],
  tour: [[111, 162], [194, 222], [303, 147], null],
  mount,
});
})();
