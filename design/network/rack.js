const {
  Cam, fit, proj, facing, rings, prism, rrect, poly, seg, lerp, EASE_LIFT, reducedMotion,
  mk, solid, put, place, tween, tset, tval, tdone, pointer, register, disposer,
} = HL;

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let reach = value, active = -1, elapsed = 0;
  const C = Cam(45, .5, 1.5);
  fit(C, [[-84, 28, 0], [-84, 88, 0], [-28, 34, 85], [72, -52, 0], [72, -10, 155], [-18, 18, 184]], 200, 166);
  const P = proj(C), front = facing(C);
  const offsets = [[-18, 18, 0], [30, -30, 17], [30, -30, 30], [-6, 6, 0], [-20, 20, 0]];
  const projections = offsets.map(([dx, dy, dz]) => (x, y, z) => P(x + dx, y + dy, z + dz));
  // A real open rack: two back rails and three thin shelves, behind the devices.
  for (const x of [-8, 68]) {
    const [ring, inner] = rings(x - 1.7, -51, x + 1.7, -47.6, 1.5, .6);
    put(solid(svg), prism(P, front, ring, inner, 0, 123));
  }
  for (const z of [0, 76, 103]) {
    const [ring, inner] = rings(-9, -52, 71, -9, 3, 1);
    put(solid(svg), prism(P, front, ring, inner, z, z + 2.5));
  }
  const links = Array.from({ length: 4 }, () => mk('path', { class: 'nf sil' }, svg));
  const packet = mk('circle', { r: 1.5, class: 'dot' }, svg);
  const groups = Array.from({ length: 5 }, () => mk('g', {}, svg));
  const cloud = mk('path', { class: 'sil' }, groups[0]);
  const cloudCrease = mk('path', { class: 'nf lo' }, groups[0]);
  const router = solid(groups[1]), antennas = [solid(groups[1]), solid(groups[1])];
  const routerVents = mk('path', { class: 'nf lo' }, groups[1]);
  const routerLights = [0, 1, 2].map(() => mk('circle', { r: .8, class: 'dot m' }, groups[1]));
  const sw = solid(groups[2]);
  const ports = Array.from({ length: 6 }, () => mk('path', { class: 'nf' }, groups[2]));
  const base = solid(groups[3]), stem = solid(groups[3]), monitor = solid(groups[3]);
  const screen = mk('path', { class: 'nf lo' }, groups[3]);
  const keyboard = solid(groups[3]), keys = mk('path', { class: 'nf lo' }, groups[3]);
  const server = solid(groups[4]);
  const bays = Array.from({ length: 3 }, () => mk('path', { class: 'nf' }, groups[4]));
  const indicators = bays.map(() => mk('circle', { r: .8, class: 'dot m' }, groups[4]));
  const serverVents = mk('path', { class: 'nf lo' }, groups[4]);
  const lifts = groups.map(() => tween(0)), drawn = groups.map(() => NaN);
  const names = ['internet', 'router', 'switch', 'komputer', 'serwer'];
  const centres = [[0, 0, 158], [0, 0, 103], [0, 0, 55], [-50, 50, 40], [50, -50, 32]].map((point, i) => projections[i](...point));
  const hitSizes = [[58, 29], [55, 31], [56, 21], [53, 54], [38, 52]];
  const distance = [[0, 1, 2, 3, 3], [1, 0, 1, 2, 2], [2, 1, 0, 1, 1], [3, 2, 1, 0, 2], [3, 2, 1, 2, 0]];
  let curves = [];

  function block(P, part, x0, y0, x1, y1, radius, z0, z1, lift) {
    const [ring, inner] = rings(x0, y0, x1, y1, radius, Math.min(.7, radius / 2));
    put(part, prism(P, front, ring, inner, z0 + lift, z1 + lift));
  }
  function face(P, x0, z0, x1, z1, y, lift, radius = 1.2) {
    return poly(rrect(x0, z0, x1, z1, radius, 6).map(p => P(p.u, y, p.v + lift)));
  }
  function drawCloud(lift) {
    const P = projections[0];
    const q = (u, v) => P(u * Math.SQRT1_2, -u * Math.SQRT1_2, 144 + v + lift).join(',');
    cloud.setAttribute('d', `M${q(-26, 0)} C${q(-44, 0)} ${q(-44, 23)} ${q(-26, 23)} C${q(-23, 42)} ${q(4, 42)} ${q(10, 25)} C${q(25, 32)} ${q(35, 20)} ${q(31, 12)} C${q(45, 10)} ${q(42, -2)} ${q(29, -2)} L${q(-26, 0)} Z`);
    cloudCrease.setAttribute('d', `M${q(-26, 3)} Q${q(-4, 1)} ${q(28, 1)}`);
  }
  function drawRouter(lift) {
    const P = (x, y, z) => projections[1](x + lift, y + lift, z - lift);
    block(P, router, -30, -16, 30, 16, 5, 90, 101, lift);
    [-24, 21].forEach((x, i) => block(P, antennas[i], x, -12, x + 3, -9, 1.4, 101, 121, lift));
    routerVents.setAttribute('d', [-18, -10, -2, 6, 14].map(x => seg(P(x, -3, 101 + lift), P(x, 5, 101 + lift))).join(''));
    routerLights.forEach((dot, i) => place(dot, P(-10 + i * 9, 16, 95 + lift)));
  }
  function drawSwitch(lift) {
    const P = (x, y, z) => projections[2](x + lift, y + lift, z - lift);
    block(P, sw, -35, -16, 35, 16, 3, 50, 59, lift);
    ports.forEach((port, i) => port.setAttribute('d', face(P, -28 + i * 10, 52, -21 + i * 10, 56.5, 16.1, lift, .7)));
  }
  function drawComputer(lift) {
    const P = projections[3];
    block(P, base, -61, 44, -39, 59, 3, 0, 3, lift);
    block(P, stem, -53, 46, -48, 50, 1.8, 3, 29, lift);
    block(P, monitor, -76, 42, -24, 47, 2, 26, 65, lift);
    screen.setAttribute('d', face(P, -72, 32, -28, 61, 47.1, lift, 1.8));
    block(P, keyboard, -75, 64, -28, 78, 2.5, 0, 3, lift);
    keys.setAttribute('d', [68, 72, 75].map(y => seg(P(-71, y, 3 + lift), P(-32, y, 3 + lift))).join(''));
  }
  function drawServer(lift) {
    const P = (x, y, z) => projections[4](x + lift, y + lift, z - lift);
    block(P, server, 36, -63, 65, -37, 3, 0, 65, lift);
    bays.forEach((bay, i) => {
      const z = 16 + i * 15;
      bay.setAttribute('d', face(P, 40, z, 61, z + 10, -36.9, lift));
      place(indicators[i], P(57, -36.8, z + 5 + lift));
    });
    serverVents.setAttribute('d', [42, 48, 54, 60].map(x => seg(P(x, -55, 65 + lift), P(x, -44, 65 + lift))).join(''));
  }
  const draw = [drawCloud, drawRouter, drawSwitch, drawComputer, drawServer];
  function drawLinks(z) {
    const port = (i, x, y, height) => {
      const slide = [1, 2, 4].includes(i) ? z[i] : 0;
      return projections[i](x + slide, y + slide, height);
    };
    const pairs = [
      [port(0, 0, 0, 144), port(1, 0, 0, 101)],
      [port(1, 0, 16, 95), port(2, 0, -12, 59)],
      [port(2, -24, 16, 54), port(3, -75, 43, 34)],
      [port(2, 24, 16, 54), port(4, 37, -37, 26)],
    ];
    curves = pairs.map(([a, b]) => [a, [a[0], lerp(a[1], b[1], .55)], [b[0], lerp(a[1], b[1], .65)], b]);
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
    if (!reducedMotion()) elapsed += dt;
    const cycle = elapsed / 3.2, progress = Math.min((cycle % 1) / .85, 1) * 3;
    const leg = Math.min(2, Math.floor(progress)), branch = Math.floor(cycle) % 2 ? 3 : 2;
    place(packet, onCurve(curves[leg < 2 ? leg : branch], EASE_LIFT(Math.min(1, progress - leg))));
    return !reducedMotion() || lifts.some(t => !tdone(t, now));
  });
  bag.add(loop.unregister);
  function choose(next) {
    if (active === next) return;
    const from = next < 0 ? active : next;
    active = next;
    const now = performance.now();
    lifts.forEach((t, i) => tset(t, next === i && [1, 2, 4].includes(i) ? reach : 0, now, distance[from][i] * 40));
    links.forEach((link, i) => link.classList.toggle('hi', next >= 0 && (i === 0 || (i === 1 && next >= 1) || (i === 2 && next === 3) || (i === 3 && next === 4))));
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
  name: 'rack',
  means: 'A workstation beside an open network rack. Hover slides a module out and traces its route to the Internet cloud.',
  rules: [1, 2, 4, 6, 7, 8, 9],
  range: [8, 16, 24],
  tour: [[187, 75], [289, 170], [289, 239], null],
  mount,
});
