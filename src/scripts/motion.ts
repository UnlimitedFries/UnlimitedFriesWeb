// Site-wide motion: scroll reveals, scroll-linked word highlight, velocity marquee,
// parallax, magnetic/tilt hovers and the custom cursor. Re-initialised on every
// client-side navigation via `astro:page-load`.

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

let marquees: { el: HTMLElement; x: number; width: number; dir: number }[] = [];
let parallax: { el: HTMLElement; speed: number }[] = [];
let wordBlocks: { el: HTMLElement; words: HTMLElement[] }[] = [];
let observer: IntersectionObserver | undefined;

let lastY = window.scrollY;
let velocity = 0;

function initReveals() {
  observer?.disconnect();
  const targets = document.querySelectorAll<HTMLElement>('[data-reveal], [data-wipe], .mask');
  if (reduced) {
    targets.forEach((el) => el.classList.add('in'));
    return;
  }
  observer = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          observer!.unobserve(e.target);
        }
      }
    },
    { rootMargin: '0px 0px -8% 0px' },
  );
  targets.forEach((el) => observer!.observe(el));
}

function initWords() {
  wordBlocks = [];
  document.querySelectorAll<HTMLElement>('[data-words]').forEach((el) => {
    if (!el.dataset.split) {
      const text = el.textContent!.trim().split(/\s+/);
      el.innerHTML = text.map((w) => `<span class="word">${w}</span>`).join(' ');
      el.dataset.split = '1';
    }
    wordBlocks.push({ el, words: [...el.querySelectorAll<HTMLElement>('.word')] });
  });
}

function initMarquees() {
  marquees = [];
  document.querySelectorAll<HTMLElement>('[data-marquee]').forEach((root) => {
    const track = root.querySelector<HTMLElement>('.marquee-track')!;
    const first = track.firstElementChild as HTMLElement;
    // Fill the track with enough copies to cover wide screens twice over.
    while (track.children.length < 4 || track.scrollWidth < innerWidth * 2.5) {
      track.appendChild(first.cloneNode(true));
    }
    marquees.push({ el: track, x: 0, width: first.offsetWidth, dir: Number(root.dataset.marquee) || -1 });
  });
}

function initParallax() {
  parallax = [...document.querySelectorAll<HTMLElement>('[data-parallax]')].map((el) => ({
    el,
    speed: Number(el.dataset.parallax) || 0.2,
  }));
}

function initMagnetic() {
  if (!finePointer || reduced) return;
  document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((el) => {
    const strength = Number(el.dataset.magnetic) || 0.3;
    el.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * strength;
      const y = (e.clientY - r.top - r.height / 2) * strength;
      el.style.transform = `translate(${x}px, ${y}px)`;
    });
    el.addEventListener('pointerleave', () => (el.style.transform = ''));
  });
}

function initTilt() {
  if (!finePointer || reduced) return;
  document.querySelectorAll<HTMLElement>('[data-tilt]').forEach((el) => {
    const max = Number(el.dataset.tilt) || 6;
    el.style.transition = 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `perspective(1000px) rotateY(${px * max}deg) rotateX(${-py * max}deg)`;
    });
    el.addEventListener('pointerleave', () => (el.style.transform = ''));
  });
}

// ---------- Cursor (created once, persists across navigations) ----------
const cursor = { x: innerWidth / 2, y: innerHeight / 2, tx: innerWidth / 2, ty: innerHeight / 2 };
let cursorEl: HTMLElement | null = null;
let cursorLabel: HTMLElement | null = null;

function initCursor() {
  if (!finePointer || reduced || cursorEl) return;
  cursorEl = document.createElement('div');
  cursorEl.className = 'cursor';
  cursorEl.setAttribute('aria-hidden', 'true');
  cursorLabel = document.createElement('span');
  cursorLabel.className = 'cursor-label';
  cursorEl.appendChild(cursorLabel);
  document.documentElement.appendChild(cursorEl);

  addEventListener('pointermove', (e) => {
    cursor.tx = e.clientX;
    cursor.ty = e.clientY;
    cursorEl!.classList.add('on');
    const t = (e.target as Element).closest<HTMLElement>('a, button, [data-cursor]');
    cursorEl!.classList.toggle('hover', !!t);
    cursorLabel!.textContent = t?.dataset.cursor ?? '';
  });
  document.addEventListener('pointerleave', () => cursorEl!.classList.remove('on'));
}

// ---------- Frame loop ----------
function frame() {
  const y = window.scrollY;
  velocity = lerp(velocity, y - lastY, 0.12);
  lastY = y;

  for (const m of marquees) {
    m.x += (1 + Math.abs(velocity) * 0.35) * m.dir * (velocity < -0.5 ? -1 : 1);
    if (m.x <= -m.width) m.x += m.width;
    if (m.x > 0) m.x -= m.width;
    const skew = Math.max(-12, Math.min(12, velocity * 0.4));
    m.el.style.transform = `translate3d(${m.x}px,0,0) skewX(${-skew}deg)`;
  }

  for (const p of parallax) {
    const r = p.el.parentElement!.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) continue;
    p.el.style.transform = `translate3d(0, ${-r.top * p.speed}px, 0)`;
  }

  for (const b of wordBlocks) {
    const r = b.el.getBoundingClientRect();
    // 0 when the block's top hits 85% of the viewport, 1 when its bottom reaches 45%.
    const start = innerHeight * 0.85;
    const end = innerHeight * 0.45;
    const progress = Math.max(0, Math.min(1, (start - r.top) / (start - end + r.height)));
    const lit = Math.round(progress * b.words.length);
    b.words.forEach((w, i) => w.classList.toggle('lit', i < lit));
  }

  if (cursorEl) {
    cursor.x = lerp(cursor.x, cursor.tx, 0.2);
    cursor.y = lerp(cursor.y, cursor.ty, 0.2);
    cursorEl.style.transform = `translate3d(${cursor.x}px, ${cursor.y}px, 0)`;
  }

  requestAnimationFrame(frame);
}

document.addEventListener('astro:page-load', () => {
  initReveals();
  initWords();
  initParallax();
  initMagnetic();
  initTilt();
  initCursor();
  if (!reduced) initMarquees();
  cursorEl?.classList.remove('hover');
});

requestAnimationFrame(frame);
