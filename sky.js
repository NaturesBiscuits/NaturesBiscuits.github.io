// ASCII night sky: twinkling, glittering stars on a character grid + shooting stars.
// Everything is drawn on one canvas behind the page; shooting stars are drawn first
// so the regular stars sit on top of them.
(() => {
  const canvas = document.getElementById('sky');
  const ctx = canvas.getContext('2d');

  const CELL_W = 10, CELL_H = 18;
  const FONT = '14px "JetBrains Mono", Consolas, monospace';
  const STAR_CHARS = ['.', '.', '.', "'", "'", '+', '*'];
  const STAR_RGB = [145, 152, 161];      // #9198a1, the resting star color
  const DENSITY = 0.035;                 // share of grid cells holding a star

  // Glitter: a star fades in to #FFFFFF growing . -> + -> * (soft glow), then fades back.
  // About 2 stars per second start glittering, one at a time at staggered moments.
  const GLITTER_EVERY_MIN = 0.3, GLITTER_EVERY_MAX = 0.7; // seconds between glitters (avg 0.5s)
  const GLITTER_BATCH_MIN = 1, GLITTER_BATCH_MAX = 1;     // one star per glitter
  const GLITTER_MIN = 3.5, GLITTER_MAX = 6; // seconds for one slow fade in + fade out

  // Shooting star: one character per row and column, so it is a single clean diagonal.
  //   *
  //    /
  //     /
  //      .
  const TRAIL = ['*', '/', '/', '/', '/', '/', '.', '.', "'"]; // head -> tail
  const SHOOT_EVERY = 5;                 // seconds between automatic shooting stars
  const SHOOT_SPEED = 24;                // cells per second

  let cols = 0, rows = 0, stars = [], shooters = [];
  let sinceShot = 0;
  let nextGlitter = 1;

  const rand = (a, b) => a + Math.random() * (b - a);

  function startGlitters() {
    const n = Math.round(rand(GLITTER_BATCH_MIN, GLITTER_BATCH_MAX));
    for (let i = 0; i < n; i++) {
      const s = stars[Math.floor(Math.random() * stars.length)];
      if (!s || s.glitter >= 0) continue;
      s.glitter = 0;
      s.length = rand(GLITTER_MIN, GLITTER_MAX);
    }
  }

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(innerWidth * dpr);
    canvas.height = Math.round(innerHeight * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cols = Math.ceil(innerWidth / CELL_W);
    rows = Math.ceil(innerHeight / CELL_H);

    stars = [];
    const count = Math.floor(cols * rows * DENSITY);
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.floor(Math.random() * cols),
        y: Math.floor(Math.random() * rows),
        ch: STAR_CHARS[Math.floor(Math.random() * STAR_CHARS.length)],
        phase: Math.random() * Math.PI * 2,
        speed: 0.5 + Math.random() * 1.5,
        base: 0.3 + Math.random() * 0.4,
        glitter: -1,   // seconds into the current glitter, -1 when resting
        length: 0,     // duration of the current glitter
      });
    }
  }

  function spawnShooter() {
    // Enter from the top edge (right-hand part) and fall down-left.
    shooters.push({
      x: Math.floor(cols * (0.35 + Math.random() * 0.65)),
      y: -1,
      t: 0,
    });
    sinceShot = 0;
  }

  function cell(x, y, ch, rgb, alpha, glow) {
    ctx.globalAlpha = alpha;
    ctx.fillStyle = `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
    ctx.shadowBlur = glow;
    ctx.fillText(ch, x * CELL_W, y * CELL_H);
  }

  const mixToWhite = (rgb, m) => rgb.map(v => Math.round(v + (255 - v) * m));

  let last = performance.now();
  function frame(now) {
    // Cap dt so a backgrounded tab does not resume with a huge jump.
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    const time = now / 1000;

    ctx.clearRect(0, 0, innerWidth, innerHeight);
    ctx.font = FONT;
    ctx.textBaseline = 'top';
    ctx.shadowColor = '#ffffff';

    // 1. Shooting stars (back layer). Timer lives in the animation loop, so nothing
    //    queues up while the tab is hidden, and only one runs at a time.
    sinceShot += dt;
    if (sinceShot >= SHOOT_EVERY && shooters.length === 0) spawnShooter();

    shooters = shooters.filter(sh => {
      sh.t += dt * SHOOT_SPEED;
      const step = Math.floor(sh.t);
      for (let i = 0; i < TRAIL.length; i++) {
        const k = step - i;
        if (k < 0) continue;
        const head = i === 0;
        const fade = 1 - i / TRAIL.length;
        cell(sh.x - k, sh.y + k, TRAIL[i],
          head ? [255, 255, 255] : [201, 209, 217],
          head ? 1 : 0.9 * fade,
          head ? 8 : 0);
      }
      const tail = step - TRAIL.length;
      return sh.x - tail > -1 && sh.y + tail < rows + 1;
    });

    // 2. Stars (front layer): gentle twinkle plus the occasional slow glitter to white.
    nextGlitter -= dt;
    if (nextGlitter <= 0) {
      startGlitters();
      nextGlitter = rand(GLITTER_EVERY_MIN, GLITTER_EVERY_MAX);
    }
    for (const s of stars) {
      let alpha = s.base + Math.sin(time * s.speed + s.phase) * 0.2;
      let m = 0;
      if (s.glitter >= 0) {
        s.glitter += dt;
        const p = Math.min(s.glitter / s.length, 1);
        m = Math.sin(Math.PI * p) ** 2;      // eased 0 -> 1 -> 0 : slow fade in, slow fade out
        if (p >= 1) s.glitter = -1;
      }
      // Grow . -> + -> * as it brightens, then shrink back as it fades.
      const ch = m > 0.75 ? '*' : m > 0.35 ? '+' : s.ch;
      cell(s.x, s.y, ch, mixToWhite(STAR_RGB, m), alpha + (1 - alpha) * m, m * 5);
    }

    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
    requestAnimationFrame(frame);
  }

  addEventListener('resize', resize);
  resize();
  window.spawnShooter = spawnShooter;
  requestAnimationFrame(frame);
})();
