// ASCII night sky: random twinkling stars on a character grid + shooting stars every 5s.
(() => {
  const canvas = document.getElementById('sky');
  const ctx = canvas.getContext('2d');
  const CELL_W = 10, CELL_H = 18, FONT = '14px ui-monospace, SFMono-Regular, Consolas, monospace';
  const STAR_CHARS = ['.', '.', '.', "'", "'", '+', '*'];
  const TRAIL = ['*', '=', '-', '-', '-', '~', '.', '.', "'"]; // head -> tail
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let cols, rows, stars = [], shooters = [];

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = innerWidth * dpr;
    canvas.height = innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
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
      });
    }
  }

  function spawnShooter() {
    // Start along the top or right edge, travel down-left on a grid diagonal.
    const fromTop = Math.random() < 0.6;
    shooters.push({
      x: fromTop ? Math.floor(cols * (0.3 + Math.random() * 0.7)) : cols + 2,
      y: fromTop ? -2 : Math.floor(Math.random() * rows * 0.4),
      dx: -1,
      dy: 0.5,          // 2 columns per row ≈ a 45° look with tall monospace cells
      cps: 45,          // cells per second
      t: 0,
    });
  }

  function cellAt(x, y, ch, color, alpha) {
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.fillText(ch, x * CELL_W, y * CELL_H);
  }

  let last = performance.now();
  function frame(now) {
    const dt = Math.min((now - last) / 1000, 0.1);
    last = now;
    const time = now / 1000;
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    ctx.font = FONT;
    ctx.textBaseline = 'top';

    for (const s of stars) {
      const a = reduce ? s.base : s.base + Math.sin(time * s.speed + s.phase) * 0.25;
      cellAt(s.x, s.y, s.ch, '#9198a1', Math.max(0.08, a));
    }

    shooters = shooters.filter(sh => {
      sh.t += dt * sh.cps;
      const step = Math.floor(sh.t);
      for (let i = 0; i < TRAIL.length; i++) {
        const k = step - i;
        if (k < 0) continue;
        const gx = Math.round(sh.x + sh.dx * k);
        const gy = Math.round(sh.y + sh.dy * k);
        const head = i === 0;
        cellAt(gx, gy, TRAIL[i], head ? '#f0f6fc' : '#4493f8', head ? 1 : 0.9 - i / TRAIL.length);
      }
      const tailX = sh.x + sh.dx * (step - TRAIL.length);
      const tailY = sh.y + sh.dy * (step - TRAIL.length);
      return tailX > -2 && tailY < rows + 2;
    });

    ctx.globalAlpha = 1;
    requestAnimationFrame(frame);
  }

  addEventListener('resize', resize);
  resize();
  if (!reduce) {
    spawnShooter();
    setInterval(spawnShooter, 5000);
  }
  requestAnimationFrame(frame);
})();
