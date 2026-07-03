import { prefersReducedMotion } from '../util/dom.ts';

// ============================================================================
//  Living constellation background — a canvas of drifting nodes that link with
//  faint lines and lean toward the cursor. Pure canvas, no dependencies.
// ============================================================================

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
}

export function initBackground(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const reduced = prefersReducedMotion();
  let width = 0;
  let height = 0;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  const pointer = { x: -9999, y: -9999 };
  let nodes: Node[] = [];
  let raf = 0;

  function density(): number {
    // Scale node count to viewport area, capped for performance.
    return Math.min(Math.floor((width * height) / 16000), 120);
  }

  function seed(): void {
    nodes = Array.from({ length: density() }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      r: Math.random() * 1.6 + 0.4,
    }));
  }

  function resize(): void {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    seed();
  }

  function frame(): void {
    ctx!.clearRect(0, 0, width, height);

    for (const n of nodes) {
      n.x += n.vx;
      n.y += n.vy;

      // Gentle attraction toward the pointer.
      const dx = pointer.x - n.x;
      const dy = pointer.y - n.y;
      const dist2 = dx * dx + dy * dy;
      if (dist2 < 26000) {
        n.x += dx * 0.0009;
        n.y += dy * 0.0009;
      }

      if (n.x < 0 || n.x > width) n.vx *= -1;
      if (n.y < 0 || n.y > height) n.vy *= -1;

      ctx!.beginPath();
      ctx!.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx!.fillStyle = 'rgba(120, 190, 255, 0.55)';
      ctx!.fill();
    }

    // Link nearby nodes.
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i];
        const b = nodes[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 130) {
          const alpha = (1 - d / 130) * 0.22;
          ctx!.strokeStyle = `rgba(94, 234, 212, ${alpha})`;
          ctx!.lineWidth = 0.6;
          ctx!.beginPath();
          ctx!.moveTo(a.x, a.y);
          ctx!.lineTo(b.x, b.y);
          ctx!.stroke();
        }
      }
    }

    raf = requestAnimationFrame(frame);
  }

  resize();
  window.addEventListener('resize', resize);
  window.addEventListener('pointermove', (e) => {
    pointer.x = e.clientX;
    pointer.y = e.clientY;
  });
  window.addEventListener('pointerleave', () => {
    pointer.x = -9999;
    pointer.y = -9999;
  });

  if (reduced) {
    // Draw a single static frame and stop.
    frame();
    cancelAnimationFrame(raf);
  } else {
    frame();
  }
}
