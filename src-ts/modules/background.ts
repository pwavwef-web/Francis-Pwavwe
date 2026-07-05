import { prefersReducedMotion } from '../util/dom.ts';

// ============================================================================
//  Cinematic ambient background.
//
//  Primary path: a full-screen WebGL fragment shader that renders a living,
//  domain-warped nebula with drifting energy filaments, a parallax starfield
//  and a pointer-reactive bloom. It breathes with time, leans toward the
//  cursor, and shifts hue as the page scrolls — the "movie" layer of the site.
//
//  It pauses whenever the tab is hidden OR the hero scrolls out of view, guards
//  against ever stacking two render loops, and recovers from GPU context loss.
//
//  Fallback path: if WebGL is unavailable we degrade to a lightweight canvas
//  constellation so there is always motion. Reduced-motion users get a single
//  static frame in either path.
// ============================================================================

const VERT = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;

uniform vec2  u_res;
uniform float u_time;
uniform vec2  u_pointer;   // pixels
uniform float u_pointerOn; // 0 | 1
uniform float u_scroll;    // 0..1

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 6; i++) {
    v += a * noise(p);
    p = m * p;
    a *= 0.5;
  }
  return v;
}

// Sparse twinkling star layer built on a hashed grid.
float starLayer(vec2 uvpix, float density, float size, float tw) {
  vec2 g = uvpix * density;
  vec2 id = floor(g);
  vec2 gv = fract(g) - 0.5;
  float h = hash(id);
  if (h < 0.966) return 0.0;
  float d = length(gv);
  float star = smoothstep(size, 0.0, d);
  star *= 0.55 + 0.45 * sin(u_time * tw + h * 6.2831);
  return star;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res.xy;
  vec2 p  = (gl_FragCoord.xy - 0.5 * u_res.xy) / u_res.y;
  float t = u_time * 0.045;

  // Scroll gently pushes the flow field upward as you travel down the page.
  p.y += u_scroll * 1.1;

  // Two-stage domain warp for organic, flowing clouds.
  vec2 q = vec2(fbm(p * 1.5 + vec2(0.0, t)),
                fbm(p * 1.5 + vec2(5.2, -t)));
  vec2 r = vec2(fbm(p * 2.0 + 3.0 * q + vec2(1.7, 9.2) + 0.4 * t),
                fbm(p * 2.0 + 3.0 * q + vec2(8.3, 2.8) - 0.4 * t));
  float f = fbm(p * 2.0 + 2.4 * r + t);

  vec3 space  = vec3(0.016, 0.020, 0.043);
  vec3 cyan   = vec3(0.37, 0.92, 0.83);
  vec3 violet = vec3(0.55, 0.36, 0.96);
  vec3 gold   = vec3(0.83, 0.69, 0.22);

  vec3 col = space;
  col = mix(col, violet * 0.55, clamp(r.y * 0.9, 0.0, 1.0) * 0.55);
  float neb = smoothstep(0.15, 0.95, f);
  col = mix(col, cyan * 0.62, neb * 0.55);

  // Gold shimmer riding the densest crests, breathing with hue-shift on scroll.
  col += gold * 0.06 * smoothstep(0.62, 1.0, f) * (0.5 + 0.5 * sin(t * 2.4 + u_scroll * 6.0));

  // Bright energy filaments where the two warp channels cross.
  float fil = pow(1.0 - abs(q.x - q.y), 7.0);
  col += cyan * fil * 0.4;

  // Parallax starfield.
  vec2 sp = gl_FragCoord.xy / u_res.y;
  col += vec3(0.75, 0.92, 1.0) * starLayer(sp, 26.0, 0.34, 2.1);
  col += vec3(0.85, 0.80, 1.0) * starLayer(sp + 11.3, 42.0, 0.30, 3.3) * 0.7;
  col += vec3(1.0, 0.95, 0.85) * starLayer(sp + 27.7, 60.0, 0.26, 1.4) * 0.5;

  // Pointer bloom.
  vec2 ptr = u_pointer / u_res.xy;
  float pd = distance(uv, ptr);
  col += cyan * u_pointerOn * smoothstep(0.34, 0.0, pd) * 0.14;

  // Vignette + film grain.
  float vig = smoothstep(1.25, 0.35, length(uv - 0.5));
  col *= vig;
  col += (hash(gl_FragCoord.xy + fract(u_time)) - 0.5) * 0.028;

  gl_FragColor = vec4(col, 1.0);
}
`;

function compile(gl: WebGLRenderingContext, type: number, src: string): WebGLShader | null {
  const sh = gl.createShader(type);
  if (!sh) return null;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}

function initWebGL(canvas: HTMLCanvasElement): boolean {
  const ctx =
    (canvas.getContext('webgl', { antialias: false, alpha: false, depth: false }) as
      | WebGLRenderingContext
      | null) ??
    (canvas.getContext('experimental-webgl') as WebGLRenderingContext | null);
  if (!ctx) return false;
  const gl = ctx; // narrowed, non-null for the closures below

  const reduced = prefersReducedMotion();
  const SCALE = 0.7; // render below native res; soft nebula upscales cleanly
  const pointer = { x: -9999, y: -9999, on: 0 };
  let scroll = 0;
  let dpr = Math.min(window.devicePixelRatio || 1, 1.6);
  let raf = 0;
  let running = false;
  let pageVisible = true;
  let heroVisible = true;
  const startTime = performance.now();

  // Uniform locations — re-resolved if the context is ever restored.
  let uRes: WebGLUniformLocation | null = null;
  let uTime: WebGLUniformLocation | null = null;
  let uPtr: WebGLUniformLocation | null = null;
  let uPtrOn: WebGLUniformLocation | null = null;
  let uScroll: WebGLUniformLocation | null = null;

  function build(): boolean {
    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return false;
    const prog = gl.createProgram();
    if (!prog) return false;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return false;
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'a_pos');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    uRes = gl.getUniformLocation(prog, 'u_res');
    uTime = gl.getUniformLocation(prog, 'u_time');
    uPtr = gl.getUniformLocation(prog, 'u_pointer');
    uPtrOn = gl.getUniformLocation(prog, 'u_pointerOn');
    uScroll = gl.getUniformLocation(prog, 'u_scroll');
    return true;
  }

  if (!build()) return false;

  function resize(): void {
    dpr = Math.min(window.devicePixelRatio || 1, 1.6);
    const w = Math.floor(canvas.clientWidth * dpr * SCALE);
    const h = Math.floor(canvas.clientHeight * dpr * SCALE);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    gl.viewport(0, 0, w, h);
    gl.uniform2f(uRes, w, h);
  }

  function render(now: number): void {
    const h = canvas.height;
    gl.uniform1f(uTime, (now - startTime) / 1000);
    gl.uniform2f(uPtr, pointer.x * SCALE, h - pointer.y * SCALE);
    gl.uniform1f(uPtrOn, pointer.on);
    gl.uniform1f(uScroll, scroll);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    if (running) raf = requestAnimationFrame(render);
  }

  // Exactly one render loop, ever. start() is a no-op if already running.
  function start(): void {
    if (running || reduced) return;
    running = true;
    raf = requestAnimationFrame(render);
  }
  function stop(): void {
    running = false;
    cancelAnimationFrame(raf);
  }
  function sync(): void {
    if (pageVisible && heroVisible) start();
    else stop();
  }

  resize();
  window.addEventListener('resize', resize);
  window.addEventListener(
    'pointermove',
    (e) => {
      pointer.x = e.clientX * dpr;
      pointer.y = e.clientY * dpr;
      pointer.on = 1;
    },
    { passive: true },
  );
  window.addEventListener('pointerleave', () => (pointer.on = 0));
  window.addEventListener(
    'scroll',
    () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      scroll = max > 0 ? window.scrollY / max : 0;
      // Calm the nebula as the reader descends into content — vivid in the
      // hero, quieter behind copy — which lifts text contrast everywhere.
      canvas.style.opacity = String(1 - Math.min(scroll, 1) * 0.5);
    },
    { passive: true },
  );

  // Pause while the tab is hidden.
  document.addEventListener('visibilitychange', () => {
    pageVisible = !document.hidden;
    sync();
  });

  // Pause once the hero scrolls off-screen — no point burning the GPU on a
  // full-screen shader nobody can see behind the content.
  const hero = document.getElementById('home');
  if (hero && 'IntersectionObserver' in window) {
    new IntersectionObserver(
      (entries) => {
        heroVisible = entries[0]?.isIntersecting ?? true;
        sync();
      },
      { threshold: 0 },
    ).observe(hero);
  }

  // Recover gracefully from GPU context loss (driver reset, GPU switch, etc.).
  canvas.addEventListener(
    'webglcontextlost',
    (e) => {
      e.preventDefault();
      stop();
    },
    false,
  );
  canvas.addEventListener(
    'webglcontextrestored',
    () => {
      if (build()) {
        resize();
        sync();
      }
    },
    false,
  );

  if (reduced) {
    render(startTime); // one static frame, no loop
  } else {
    start();
  }
  return true;
}

// ---------------------------------------------------------------------------
//  2D fallback — the original lightweight constellation, trimmed.
// ---------------------------------------------------------------------------
function initCanvas2D(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const reduced = prefersReducedMotion();
  let width = 0;
  let height = 0;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  const pointer = { x: -9999, y: -9999 };
  let nodes: { x: number; y: number; vx: number; vy: number; r: number }[] = [];

  const density = (): number => Math.min(Math.floor((width * height) / 16000), 110);

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
      const dx = pointer.x - n.x;
      const dy = pointer.y - n.y;
      if (dx * dx + dy * dy < 26000) {
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
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i];
        const b = nodes[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 130) {
          ctx!.strokeStyle = `rgba(94, 234, 212, ${(1 - d / 130) * 0.22})`;
          ctx!.lineWidth = 0.6;
          ctx!.beginPath();
          ctx!.moveTo(a.x, a.y);
          ctx!.lineTo(b.x, b.y);
          ctx!.stroke();
        }
      }
    }
    if (!reduced) requestAnimationFrame(frame);
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
  frame();
}

export function initBackground(canvas: HTMLCanvasElement): void {
  try {
    if (initWebGL(canvas)) return;
  } catch {
    /* fall through to 2D */
  }
  initCanvas2D(canvas);
}
