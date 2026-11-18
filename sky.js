// ASCII night sky: twinkling, glittering stars on a character grid + shooting stars.
(() => {
  const sky = document.getElementById('sky');
  const fx = document.getElementById('sky-fx'); // shooting stars, drawn above the content
  const sctx = sky.getContext('2d');
  const fctx = fx.getContext('2d');
  const CELL_W = 10, CELL_H = 18, FONT = '14px ui-monospace, SFMono-Regular, Consolas, monospace';
  const STAR_CHARS = ['.', '.', '.', "'", "'", '+', '*'];
  const TRAIL = ['*', '=', '=', '-', '-', '-', '~', '~', '.', '.', "'", "'"]; // head -> tail
  const BASE_RGB = [145, 152, 161];   // #9198a1
  const FLASH_TIME = 1.6;             // seconds for a glitter: fade to #FFFFFF and back
  const GLITTER_RATE = 0.06;          // chance per star per second to start glittering
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let cols, rows, stars = [], shooters = [];

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    for (const [c, ctx] of [[sky, sctx], [fx, fctx]]) {
      c.width = innerWidth * dpr;
      c.height = innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    cols = Math.ceil(innerWidth / CELL_W);
    rows = Math.ceil(innerHeight / CELL_H);
    stars = [];
    const count = Math.floor(cols * rows * 0.035);
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.floor(Math.random() * cols),
        y: Math.floor(Math.random() * rows),
        ch: STAR_CHARS[Math.floor(Math.random() * STAR_CHARS.length)],
        phase: Math.random() * Math.PI * 2,
        speed: 0.5 + Math.random() * 1.5,
        base: 0.25 + Math.random() * 0.5,
        flash: -1, // seconds into a glitter, or -1 when idle
      });
    }
  }

  function spawnShooter() {
    const fromTop = Math.random() < 0.6;
    shooters.push({
      x: fromTop ? Math.floor(cols * (0.3 + Math.random() * 0.7)) : cols + 2,
      y: fromTop ? -2 : Math.floor(Math.random() * rows * 0.4),
      dx: -1,
      dy: 0.5,   // 2 columns per row ≈ 45° with tall monospace cells
      cps: 32,   // cells per second
      t: 0,
    });
  }
  window.spawnShooter = spawnShooter;

  function draw(ctx, x, y, ch, color, alpha) {
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.fillText(ch, x * CELL_W, y * CELL_H);
  }

  let last = performance.now();
  function frame(now) {
    const dt = Math.min((now - last) / 1000, 0.1);
    last = now;
    const time = now / 1000;

    for (const ctx of [sctx, fctx]) {
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      ctx.font = FONT;
      ctx.textBaseline = 'top';
    }

    for (const s of stars) {
      let a = reduce ? s.base : s.base + Math.sin(time * s.speed + s.phase) * 0.25;
      let mix = 0;
      if (!reduce) {
        if (s.flash < 0 && Math.random() < GLITTER_RATE * dt) s.flash = 0;
        if (s.flash >= 0) {
          s.flash += dt;
          mix = Math.sin(Math.PI * Math.min(s.flash / FLASH_TIME, 1)); // 0 -> 1 -> 0
          if (s.flash >= FLASH_TIME) s.flash = -1;
        }
      }
      const c = BASE_RGB.map(v => Math.round(v + (255 - v) * mix));
      a = a + (1 - a) * mix;
      draw(sctx, s.x, s.y, s.ch, `rgb(${c})`, Math.max(0.08, a));
    }

    shooters = shooters.filter(sh => {
      sh.t += dt * sh.cps;
      const step = Math.floor(sh.t);
      for (let i = 0; i < TRAIL.length; i++) {
        const k = step - i;
        if (k < 0) continue;
        const head = i === 0;
        draw(fctx, Math.round(sh.x + sh.dx * k), Math.round(sh.y + sh.dy * k), TRAIL[i],
          head ? '#ffffff' : '#c9d1d9', head ? 1 : 0.85 * (1 - i / TRAIL.length));
      }
      const tail = step - TRAIL.length;
      return sh.x + sh.dx * tail > -2 && sh.y + sh.dy * tail < rows + 2;
    });

    sctx.globalAlpha = fctx.globalAlpha = 1;
    requestAnimationFrame(frame);
  }

  addEventListener('resize', resize);
  resize();
  if (!reduce) setInterval(spawnShooter, 5000);
  document.getElementById('shoot-btn')?.addEventListener('click', spawnShooter);
  requestAnimationFrame(frame);
})();
