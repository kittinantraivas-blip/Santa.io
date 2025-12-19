class DirectionJoystick {
  constructor(canvas, opts = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.deadzone = Math.max(0, Math.min(0.99, opts.deadzone ?? 0.10));
    this.center = { x: 0, y: 0 };
    this.baseRadius = 0;
    this.stickRadius = 0;
    this.stickPos = { x: 0, y: 0 };
    this.value = { x: 0, y: 0, force: 0 };
  }

  resizeCssPx(cssPx) {
    const size = Math.max(80, Math.round(cssPx));
    const dpr = Math.max(1, window.devicePixelRatio || 1);

    // ทำให้คมบนจอ retina
    this.canvas.style.width = size + 'px';
    this.canvas.style.height = size + 'px';
    this.canvas.width = Math.round(size * dpr);
    this.canvas.height = Math.round(size * dpr);

    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    this.center.x = size * 0.5;
    this.center.y = size * 0.5;
    this.baseRadius = size * 0.28;
    this.stickRadius = this.baseRadius * 0.45;
    this.stickPos.x = this.center.x;
    this.stickPos.y = this.center.y;

    this.draw();
  }

  setFromTarget(target, screenW, screenH) {
    if (!target || !screenW || !screenH) return;

    // target จาก canvas.js เป็นพิกัดแบบ "เทียบกึ่งกลางจอ"
    // normalize ให้เป็น [-1..1]
    let nx = target.x / (screenW * 0.5);
    let ny = target.y / (screenH * 0.5);

    // clamp
    nx = Math.max(-1, Math.min(1, nx));
    ny = Math.max(-1, Math.min(1, ny));

    const mag = Math.hypot(nx, ny);
    if (mag <= this.deadzone) {
      this.value = { x: 0, y: 0, force: 0 };
      this.stickPos.x = this.center.x;
      this.stickPos.y = this.center.y;
      this.draw();
      return;
    }

    const scaled = (mag - this.deadzone) / (1 - this.deadzone);
    const ux = (nx / mag) * scaled;
    const uy = (ny / mag) * scaled;

    this.value = { x: ux, y: uy, force: Math.min(1, Math.max(0, scaled)) };

    const max = this.baseRadius;
    this.stickPos.x = this.center.x + ux * max;
    this.stickPos.y = this.center.y + uy * max;

    this.draw();
  }

  draw() {
    const ctx = this.ctx;
    // หลัง setTransform แล้ว เราวาดด้วย “CSS px space”
    const w = (this.canvas.width / Math.max(1, window.devicePixelRatio || 1));
    const h = (this.canvas.height / Math.max(1, window.devicePixelRatio || 1));

    ctx.clearRect(0, 0, w, h);

    // base
    ctx.save();
    ctx.globalAlpha = 0;
    ctx.beginPath();
    ctx.arc(this.center.x, this.center.y, this.baseRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#222";
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#444";
    ctx.stroke();
    ctx.restore();

    // deadzone ring
    if (this.deadzone > 0) {
      ctx.save();
      ctx.globalAlpha = 0;
      ctx.beginPath();
      ctx.arc(this.center.x, this.center.y, this.baseRadius * this.deadzone, 0, Math.PI * 2);
      ctx.strokeStyle = "#3a3a3a";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    }

    // direction line
    ctx.save();
    ctx.globalAlpha = 0;
    ctx.beginPath();
    ctx.moveTo(this.center.x, this.center.y);
    ctx.lineTo(this.stickPos.x, this.stickPos.y);
    ctx.strokeStyle = "#666";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.stroke();
    ctx.restore();

    // knob
    ctx.save();
    ctx.beginPath();
    ctx.arc(this.stickPos.x, this.stickPos.y, this.stickRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffffff";
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#888";
    ctx.stroke();
    ctx.restore();
  }
}

module.exports = DirectionJoystick;
