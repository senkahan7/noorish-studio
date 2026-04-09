import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const IS_TOUCH = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
const PREFERS_REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const LOW_POWER = IS_TOUCH || PREFERS_REDUCED;
document.documentElement.classList.toggle('is-touch', IS_TOUCH);
document.documentElement.classList.toggle('reduce-motion', PREFERS_REDUCED);

// ==========================================
// 1. LOADER — "THE SLATE" Clapperboard
// ==========================================
function initLoader(onComplete) {
  const loader    = document.getElementById('siteLoader');
  if (!loader) { onComplete(); return; }

  const clap      = document.getElementById('slClap');
  const clapHead  = document.getElementById('slClapHead');
  const flash     = document.getElementById('slFlash');
  const stage     = document.getElementById('slStage');
  const chars     = document.querySelectorAll('#slLogoChars span');
  const fillEl    = document.getElementById('slProgressFill');
  const pctEl     = document.getElementById('slPercent');
  const subEl     = document.getElementById('slLogoSub');
  const tagEl     = document.getElementById('slStageTag');
  const pageWipe  = document.getElementById('pageWipe');

  // Initial states
  gsap.set(clap,  { y: -(window.innerHeight * 0.5 + 320) });
  gsap.set([flash, stage], { opacity: 0 });
  gsap.set(chars, { opacity: 0, scale: 1.4, y: -8 });
  gsap.set([subEl, tagEl], { opacity: 0, y: 8 });

  const tl = gsap.timeline();

  // Phase 1: Clapperboard drops in with spring bounce
  tl.to(clap, { y: 0, duration: 0.9, ease: 'back.out(1.15)', delay: 0.25 });

  // Phase 2: Hold so viewer reads the slate
  tl.to({}, { duration: 0.6 });

  // Phase 3: Sticks SNAP + white flash + screen shake
  tl.call(() => { if (clapHead) clapHead.classList.add('is-snapped'); });
  tl.to(flash, { opacity: 1, duration: 0.04 }, '<+=0.01');
  tl.to(clap,  { x: -6, duration: 0.04, yoyo: true, repeat: 3, ease: 'none' }, '<');
  tl.to(flash, { opacity: 0, duration: 0.35 });

  // Phase 4: Clapperboard exits upward
  tl.to(clap, {
    y: -(window.innerHeight * 0.5 + 350),
    duration: 0.55,
    ease: 'power3.in'
  }, '-=0.08');

  // Phase 5: Logo stage appears
  tl.to(stage, { opacity: 1, duration: 0.12 });

  // Phase 6: Letters slam in — hard cut, no easing
  tl.to(chars, {
    opacity: 1, scale: 1, y: 0,
    duration: 0.001,
    stagger: { each: 0.07, ease: 'none' },
    ease: 'none'
  });

  // Accent glow flash on each char
  tl.call(() => {
    chars.forEach((ch, i) => {
      setTimeout(() => {
        ch.style.textShadow = '0 0 40px rgba(217,70,239,0.9)';
        setTimeout(() => { ch.style.textShadow = ''; }, 350);
      }, i * 70);
    });
  }, null, '-=0.5');

  // STUDIO sub-label
  tl.to(subEl, { opacity: 1, y: 0, duration: 0.35 }, '+=0.1');

  // Phase 7: Progress bar fills (rAF-driven)
  const PROG_MS = 1350;
  let progStart = null;
  tl.call(() => {
    const tick = (ts) => {
      if (!progStart) progStart = ts;
      const ratio = Math.min((ts - progStart) / PROG_MS, 1);
      const eased = 1 - Math.pow(1 - ratio, 2);
      const pct   = Math.round(eased * 100);
      if (fillEl) fillEl.style.width = pct + '%';
      if (pctEl)  pctEl.textContent  = pct + '%';
      if (ratio < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });

  tl.to({}, { duration: 1.45 });
  tl.to(tagEl, { opacity: 1, y: 0, duration: 0.4 });
  tl.to({}, { duration: 0.3 });

  // Phase 8: Pink page-wipe sweeps over, loader hides, wipe exits
  tl.to(pageWipe, { xPercent: 0, duration: 0.38, ease: 'power4.in' });
  tl.call(() => {
    loader.style.display = 'none';
    onComplete();
  });
  tl.to(pageWipe, {
    xPercent: 100,
    duration: 0.38,
    ease: 'power4.out',
    onComplete: () => { pageWipe.style.display = 'none'; }
  });
}


// ==========================================
// 2. TRUE TOPOGRAPHIC CANVAS
// ==========================================
class TopographicBackground {
  constructor() {
    this.canvas = document.getElementById('topoCanvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.time = 0;
    this.mouse = { x: this.width/2, y: this.height/2, targetX: this.width/2, targetY: this.height/2 };
    this.isDark = false; 
    this.lowPower = LOW_POWER;
    
    // Look up table for marching squares based on 4 corners crossing thresholds
    this.edgeTable = [
      [], [[0, 3]], [[0, 1]], [[1, 3]], [[1, 2]], [[0, 1], [2, 3]], [[0, 2]], [[2, 3]],
      [[2, 3]], [[0, 2]], [[0, 3], [1, 2]], [[1, 2]], [[1, 3]], [[0, 1]], [[0, 3]], []
    ];
    
    this.thresholds = this.lowPower ? [-2, -0.8, 0.8, 2] : [-2.4, -1.6, -0.8, 0, 0.8, 1.6, 2.4];
    this.cellSize = this.lowPower ? 28 : 18; // Higher resolution for smoother segments
    this.timeStep = this.lowPower ? 0.003 : 0.005;

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());
    if (!this.lowPower) {
      window.addEventListener('mousemove', (e) => {
        this.mouse.targetX = e.clientX;
        this.mouse.targetY = e.clientY;
      });
    }

    if (this.lowPower) {
      this.renderFrame(false);
      return;
    }
    this.render();
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    
    this.cols = Math.ceil(this.width / this.cellSize) + 1;
    this.rows = Math.ceil(this.height / this.cellSize) + 1;
    this.grid = new Float32Array(this.cols * this.rows);
    if (this.lowPower) {
      this.renderFrame(false);
    }
  }

  setTheme(isDark) {
    this.isDark = !!isDark;
    if (this.lowPower) {
      this.renderFrame(false);
    }
  }

  getValue(x, y, t, mouseX, mouseY) {
    let dx = x - mouseX;
    let dy = y - mouseY;
    let dist = Math.sqrt(dx*dx + dy*dy);
    
    // Smooth mouse repulsion effect
    let pushX = 0;
    let pushY = 0;
    if (!this.lowPower && dist < 420 && dist > 0) {
        let falloff = 1 - (dist / 420);
        let push = Math.pow(falloff, 2) * 140;
        pushX = (dx / dist) * push;
        pushY = (dy / dist) * push;
    }

    let nx = (x + pushX) * 0.0015;
    let ny = (y + pushY) * 0.0015;
    let nt = t * 1.0;

    // Layered analytic noise for beautiful concentric looping peaks
    let v = Math.sin(nx * 3.5 + nt) * Math.cos(ny * 3.5 + nt * 0.8) * 1.8 + 
            Math.sin(nx * 1.5 - nt * 0.5) * Math.cos(ny * 2.0 + nt * 0.6) * 1.2 +
            Math.sin(nx * 5.0 + ny * 4.0 + nt * 1.2) * 0.5;

    return v;
  }

  getT(vA, vB, T) {
      if (Math.abs(vB - vA) < 1e-6) return 0.5;
      return (T - vA) / (vB - vA);
  }

  getEdgePoint(edge, col, row, v0, v1, v2, v3, T) {
    let x, y;
    if (edge === 0) {
        x = col + this.getT(v0, v1, T); y = row;
    } else if (edge === 1) {
        x = col + 1; y = row + this.getT(v1, v2, T);
    } else if (edge === 2) {
        x = col + this.getT(v3, v2, T); y = row + 1;
    } else {
        x = col; y = row + this.getT(v0, v3, T);
    }
    return { x: x * this.cellSize, y: y * this.cellSize };
  }

  renderFrame(advanceTime = true) {
    if (advanceTime) {
      this.time += this.timeStep;
    }
    
    // Smooth mouse target follow
    if (!this.lowPower) {
      this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.05;
      this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.05;
    }

    this.ctx.clearRect(0, 0, this.width, this.height);
    
    // Softer line opacities for more subtle topographic feel
    this.ctx.strokeStyle = this.isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(30, 30, 30, 0.12)';
    this.ctx.lineWidth = 1.2;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    
    // Calculate noise grid once per frame
    for (let r = 0; r < this.rows; r++) {
        for (let c = 0; c < this.cols; c++) {
            let px = c * this.cellSize;
            let py = r * this.cellSize;
            this.grid[r * this.cols + c] = this.getValue(px, py, this.time, this.mouse.x, this.mouse.y);
        }
    }

    this.ctx.beginPath();

    // Reconstruct topological line segments using marching squares
    for (let r = 0; r < this.rows - 1; r++) {
        for (let c = 0; c < this.cols - 1; c++) {
            let v0 = this.grid[r * this.cols + c];
            let v1 = this.grid[r * this.cols + c + 1];
            let v2 = this.grid[(r + 1) * this.cols + c + 1];
            let v3 = this.grid[(r + 1) * this.cols + c];

            for (let T of this.thresholds) {
                let state = 0;
                if (v0 >= T) state |= 1;
                if (v1 >= T) state |= 2;
                if (v2 >= T) state |= 4;
                if (v3 >= T) state |= 8;

                if (state !== 0 && state !== 15) {
                    let segments = this.edgeTable[state];
                    for (let s of segments) {
                        let pt1 = this.getEdgePoint(s[0], c, r, v0, v1, v2, v3, T);
                        let pt2 = this.getEdgePoint(s[1], c, r, v0, v1, v2, v3, T);
                        this.ctx.moveTo(pt1.x, pt1.y);
                        this.ctx.lineTo(pt2.x, pt2.y);
                    }
                }
            }
        }
    }
    
    this.ctx.stroke();
  }

  render() {
    this.renderFrame(true);
    requestAnimationFrame(() => this.render());
  }
}

// ==========================================
// 3. BACKGROUND MORPHING (GSAP based)
// ==========================================
class BackgroundMorph {
  constructor(topoCanvas) {
    this.layers = document.querySelectorAll('.bg-morph-layer');
    this.sections = document.querySelectorAll('[data-bg]');
    this.topoCanvas = topoCanvas;
    this.currentBg = 'cream'; // Start with light hero explicitly
    this.init();
  }

  init() {
    if (LOW_POWER) {
      const observer = new IntersectionObserver(
        (entries) => {
          const visible = entries
            .filter((entry) => entry.isIntersecting && entry.intersectionRatio > 0.12)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
          if (visible.length) {
            this.morphTo(visible[0].target.dataset.bg);
          }
        },
        { threshold: [0.12, 0.25, 0.5, 0.75] }
      );
      this.sections.forEach((section) => observer.observe(section));
    } else {
      // Determine initial background based on scroll position
      this.sections.forEach(section => {
        const start = section.dataset.bgStart || 'top top';
        const end = section.dataset.bgEnd || 'bottom top';
        ScrollTrigger.create({
          trigger: section,
          start,
          end,
          onEnter: () => this.morphTo(section.dataset.bg),
          onEnterBack: () => this.morphTo(section.dataset.bg),
          invalidateOnRefresh: true
        });
      });
    }
    
    // Set initial text color match immediately
    gsap.set(document.body, { color: '#1a1a1a' });

    // Sync background to the first visible section on load
    const currentSection = Array.from(this.sections).find(section => {
      const rect = section.getBoundingClientRect();
      return rect.top <= window.innerHeight && rect.bottom >= 0;
    });
    if (currentSection) {
      this.morphTo(currentSection.dataset.bg);
    }
  }

  morphTo(bgType) {
    if (this.currentBg === bgType) return;
    this.currentBg = bgType;

    // Fade appropriate background layers
    this.layers.forEach(layer => {
      if (layer.classList.contains(`bg-morph--${bgType}`)) {
        gsap.to(layer, { opacity: 1, duration: 0.8, ease: 'power2.inOut' });
      } else {
        gsap.to(layer, { opacity: 0, duration: 0.8, ease: 'power2.inOut' });
      }
    });

    // Change canvas theme
    if (this.topoCanvas) {
      this.topoCanvas.setTheme(bgType === 'dark' || bgType === 'gradient');
    }

    // Text color swap on body
    const textColor = bgType === 'cream' ? '#1a1a1a' : '#f5f5f0';
    gsap.to(document.body, { color: textColor, duration: 0.8 });

    // Morph light-theme colors via CSS classes instead of heavy JS var animations
    const isDark = bgType === 'dark' || bgType === 'gradient';
    if (isDark) {
      document.body.classList.add('theme-dark');
    } else {
      document.body.classList.remove('theme-dark');
    }
  }
}

// ==========================================
// 4. ANIMATIONS & INTERACTIONS
// ==========================================
function initAnimations() {
  // --- A. Split Text Reveal ---
  const splitTexts = document.querySelectorAll('.split-text');

  function buildSplitFragment(el) {
    const fragment = document.createDocumentFragment();
    Array.from(el.childNodes).forEach(node => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent;
        for (let i = 0; i < text.length; i++) {
          const char = text[i];
          const span = document.createElement('span');
          span.className = 'char-split';
          span.textContent = char === ' ' ? '\u00A0' : char;
          span.style.display = 'inline-block';
          span.style.opacity = '0';
          span.style.transform = 'translateY(50px) rotate(10deg)';
          fragment.appendChild(span);
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const clone = node.cloneNode(false);
        const innerFragment = buildSplitFragment(node);
        clone.appendChild(innerFragment);
        fragment.appendChild(clone);
      }
    });
    return fragment;
  }

  splitTexts.forEach(text => {
    const fragment = buildSplitFragment(text);
    text.innerHTML = '';
    text.appendChild(fragment);

    ScrollTrigger.create({
      trigger: text,
      start: 'top 85%',
      onEnter: () => {
        gsap.to(text.querySelectorAll('.char-split'), {
          y: 0,
          rotation: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.03,
          ease: 'back.out(1.5)'
        });
      }
    });
  });

  // --- B. Gallery 3D Tilt ---
  const gallery = document.getElementById('gallery');
  if (gallery && !IS_TOUCH) {
    document.addEventListener('mousemove', (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      gsap.to(gallery, {
        rotationY: x * 4,
        rotationX: -y * 4,
        duration: 1.2,
        ease: 'power2.out',
        transformPerspective: 1500
      });
    });
  }

  // --- C. Hero Reveal on Load ---
  gsap.set('.hero-line-inner', { opacity: 0, filter: 'blur(14px)' });
  gsap.set('.hero-subtitle, .hero-services-tags', { filter: 'blur(10px)' });

  gsap.to('.hero-line-inner', {
    y: 0,
    opacity: 1,
    filter: 'blur(0px)',
    duration: 1.2,
    stagger: 0.1,
    ease: 'power4.out',
    delay: 0.2
  });
  gsap.to('.hero-subtitle', { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1, delay: 0.8 });
  gsap.to('.hero-supporting', { opacity: 1, y: 0, duration: 0.8, delay: 1 });
  gsap.to('.hero-services-tags', { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1, delay: 1.1 });

  // --- D. Horizontal Filmstrip ---
  const filmstripWrapper = document.querySelector('.filmstrip-wrapper');
  const filmstripTrack = document.querySelector('.filmstrip-track');

  const filmstripItems = Array.from(document.querySelectorAll('.filmstrip-item'));
  if (filmstripItems.length) {
    const cursorEl = document.getElementById('cursor');
    const setCursorHidden = (hidden) => {
      if (!cursorEl) return;
      cursorEl.classList.toggle('cursor--hidden', hidden);
    };

    const deactivateItem = (item) => {
      item.classList.remove('is-active');
      item.classList.remove('show-poster');
      const frame = item.querySelector('.filmstrip-embed');
      if (frame) frame.src = 'about:blank';
    };

    const activateItem = (item) => {
      filmstripItems.forEach((other) => {
        if (other !== item) deactivateItem(other);
      });
      item.classList.remove('show-poster');
      item.classList.add('is-active');
      const frame = item.querySelector('.filmstrip-embed');
      if (frame && frame.dataset.src) {
        if (!frame.src || frame.src === 'about:blank') {
          frame.src = frame.dataset.src;
        }
      }
      const media = item.querySelector('.filmstrip-media');
      if (media && media.matches(':hover')) {
        setCursorHidden(true);
      }
    };

    filmstripItems.forEach((item) => {
      const media = item.querySelector('.filmstrip-media');
      if (!media) return;
      media.addEventListener('click', () => activateItem(item));
      media.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          activateItem(item);
        }
      });
      media.addEventListener('mouseenter', () => {
        if (item.classList.contains('is-active')) {
          setCursorHidden(true);
        }
      });
      media.addEventListener('mouseleave', () => {
        setCursorHidden(false);
      });
    });

    document.addEventListener('fullscreenchange', () => {
      if (!document.fullscreenElement) {
        const activeItem = document.querySelector('.filmstrip-item.is-active');
        if (activeItem) {
          activeItem.classList.add('show-poster');
        }
      }
    });
  }

  const worksNavButtons = document.querySelectorAll('.works-nav-btn');
  if (worksNavButtons.length && filmstripTrack && filmstripWrapper) {
    let filmstripOffset = 0;
    const touchQuery = window.matchMedia('(hover: none) and (pointer: coarse)');
    let isTouch = touchQuery.matches;

    const applyFilmstripMode = () => {
      isTouch = touchQuery.matches;
      filmstripWrapper.classList.toggle('is-touch', isTouch);
      if (isTouch) {
        filmstripTrack.style.transform = 'none';
        filmstripOffset = filmstripWrapper.scrollLeft || 0;
      } else {
        filmstripWrapper.scrollLeft = 0;
        filmstripOffset = 0;
        updateFilmstrip();
      }
    };

    const updateFilmstrip = () => {
      if (isTouch) return;
      const maxOffset = Math.max(filmstripTrack.scrollWidth - filmstripWrapper.clientWidth, 0);
      filmstripOffset = Math.max(0, Math.min(filmstripOffset, maxOffset));
      filmstripTrack.style.transform = `translateX(-${filmstripOffset}px)`;
    };

    applyFilmstripMode();
    if (touchQuery.addEventListener) {
      touchQuery.addEventListener('change', applyFilmstripMode);
    }

    window.addEventListener('resize', updateFilmstrip);

    worksNavButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const direction = btn.dataset.dir === 'next' ? 1 : -1;
        const step = filmstripWrapper.clientWidth * 0.85;
        if (isTouch) {
          filmstripWrapper.scrollBy({ left: direction * step, behavior: 'smooth' });
        } else {
          filmstripOffset += direction * step;
          updateFilmstrip();
        }
      });
    });
  }

  // --- E. Manifesto Kinetic Scroll ---
  const manifestoLines = document.querySelectorAll('.manifesto-line');
  manifestoLines.forEach(line => {
    const speed = parseFloat(line.dataset.speed || 1);
    gsap.to(line, {
      scale: 1.2 * speed,
      opacity: 0.8,
      scrollTrigger: {
        trigger: '.manifesto',
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1
      }
    });
  });

  // --- F. Gallery Wipe Reveal ---
  const wipes = document.querySelectorAll('.gallery-media[data-animate="wipe"]');
  wipes.forEach(wipe => {
    wipe.classList.add('pre-reveal'); // from css layer config
    ScrollTrigger.create({
      trigger: wipe,
      start: 'top 85%',
      onEnter: () => {
        wipe.classList.remove('pre-reveal');
        wipe.classList.add('revealed');
      }
    });
  });
  
  // --- G. Floating Vectors Setup ---
  const vectors = document.querySelectorAll('.float-vec');
  if (!IS_TOUCH) {
    document.addEventListener('mousemove', (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      vectors.forEach((vec, i) => {
        const factor = (i + 1) * 5;
        gsap.to(vec, { x: x * factor, y: y * factor, rotation: x * 3, duration: 2, ease: 'power2.out' });
      });
    });
  }

  // --- H. Gallery Tab Switching ---
  const galleryTabs = document.querySelectorAll('.gallery-tab');
  const galleryPanels = document.querySelectorAll('.gallery-panel');

  galleryTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;

      // Update tab active state
      galleryTabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      // Show matching panel, hide others
      galleryPanels.forEach(panel => {
        if (panel.id === `tab-${target}`) {
          panel.classList.add('active');
          // Re-trigger wipe reveals for newly shown images
          panel.querySelectorAll('.gallery-media[data-animate="wipe"]').forEach(wipe => {
            if (!wipe.classList.contains('revealed')) {
              wipe.classList.remove('pre-reveal');
              wipe.classList.add('revealed');
            }
          });
          ScrollTrigger.refresh();
        } else {
          panel.classList.remove('active');
        }
      });
    });
  });
}

// ==========================================
// 4.5 TESTIMONIALS MARQUEE LOOP (Interactive)
// ==========================================
function initMarqueeLoop() {
  const track = document.querySelector('.marquee-track');
  if (!track || track.dataset.looped === 'true') return;

  const items = Array.from(track.children);
  if (items.length === 0) return;

  // Duplicate items for seamless wrapping
  const fragment = document.createDocumentFragment();
  items.forEach((item) => {
    const clone = item.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    fragment.appendChild(clone);
  });
  track.appendChild(fragment);

  // We only really need 2 sets if the combined width exceeds the screen width.
  // But just to be completely safe, duplicate once more if still narrow.
  while (track.scrollWidth < window.innerWidth * 2) {
    const more = document.createDocumentFragment();
    items.forEach((item) => {
      const clone = item.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      more.appendChild(clone);
    });
    track.appendChild(more);
  }
  track.dataset.looped = 'true';

  let currentX = 0;
  let targetX = 0;
  let isDragging = false;
  let startDragX = 0;
  let dragOffset = 0;
  let baseSpeed = 1; // pixels per frame
  let direction = -1; // -1 for left, 1 for right
  let scrollVelocity = 0;
  let lastScrollY = window.scrollY;
  let isHovered = false;

  // Track scroll velocity proxy
  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    // Calculate velocity
    let delta = currentScrollY - lastScrollY;
    scrollVelocity = delta * 0.15; // scalar
    lastScrollY = currentScrollY;
  }, { passive: true });

  // Hover state pauses the base automatic scroll (but drag/scroll overrides it)
  track.addEventListener('mouseenter', () => isHovered = true);
  track.addEventListener('mouseleave', () => {
    isHovered = false;
    isDragging = false;
  });

  // Drag logic
  const onDragStart = (e) => {
    isDragging = true;
    startDragX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    document.body.style.cursor = 'grabbing';
    track.style.cursor = 'grabbing';
  };
  
  const onDragMove = (e) => {
    if (!isDragging) return;
    const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    const diff = clientX - startDragX;
    targetX += diff * 1.5; // Drag sensitivity
    startDragX = clientX;
    
    // Auto-detect direction based on drag
    if (diff > 0) direction = 1;
    else if (diff < 0) direction = -1;
  };
  
  const onDragEnd = () => {
    isDragging = false;
    document.body.style.cursor = '';
    track.style.cursor = '';
  };

  track.addEventListener('mousedown', onDragStart);
  window.addEventListener('mousemove', onDragMove);
  window.addEventListener('mouseup', onDragEnd);
  
  track.addEventListener('touchstart', onDragStart, { passive: true });
  window.addEventListener('touchmove', onDragMove, { passive: true });
  window.addEventListener('touchend', onDragEnd);

  // Animation Loop
  const loop = () => {
    // 1. Friction for scroll velocity
    scrollVelocity *= 0.92;
    if (Math.abs(scrollVelocity) < 0.1) scrollVelocity = 0;

    // Change direction based on scroll velocity if it gets fast enough
    if (scrollVelocity < -1) direction = 1;   // Scroll up -> move right
    if (scrollVelocity > 1) direction = -1;   // Scroll down -> move left

    // 2. Base speed addition (only if not hovered and not dragging)
    let addedSpeed = 0;
    if (!isDragging) {
      if (!isHovered) {
        addedSpeed = baseSpeed * direction;
      }
      // Apply scroll velocity burst
      addedSpeed += (Math.abs(scrollVelocity) * direction);
      targetX += addedSpeed;
    }

    // 3. Smooth interpolation towards target
    currentX += (targetX - currentX) * 0.1;

    // 4. Wrapping logic (assuming half of the scrollWidth is the original set cloned once)
    // The exact half width is track.scrollWidth / 2, but we must measure dynamically
    const trackWidth = track.scrollWidth;
    const viewWidth = window.innerWidth;
    const wrapWidth = trackWidth / 2; // Since we duplicated everything at least once symmetrically

    if (currentX <= -wrapWidth) {
      currentX += wrapWidth;
      targetX += wrapWidth;
    } else if (currentX > 0) {
      currentX -= wrapWidth;
      targetX -= wrapWidth;
    }

    gsap.set(track, { x: currentX });
    requestAnimationFrame(loop);
  };
  
  requestAnimationFrame(loop);
}

// ==========================================
// 5. CUSTOM CURSOR
// ==========================================
class CustomCursor {
  constructor() {
    this.cursor = document.getElementById('cursor');
    this.dot = this.cursor?.querySelector('.cursor-dot');
    this.ring = this.cursor?.querySelector('.cursor-ring');
    this.mouse = { x: 0, y: 0 };
    this.pos = { x: 0, y: 0 };
    if (this.cursor) this.init();
  }
  
  init() {
    document.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });
    
    // Default scaling interaction
    document.querySelectorAll('a, button, [data-hover], input, textarea, select').forEach(el => {
      el.addEventListener('mouseenter', () => this.cursor.classList.add('cursor--hover'));
      el.addEventListener('mouseleave', () => this.cursor.classList.remove('cursor--hover'));
    });
    
    this.render();
  }
  
  render() {
    // Smooth interpolations
    this.pos.x += (this.mouse.x - this.pos.x) * 0.2;
    this.pos.y += (this.mouse.y - this.pos.y) * 0.2;
    
    if (this.dot) this.dot.style.transform = `translate(${this.mouse.x}px, ${this.mouse.y}px) translate(-50%, -50%)`;
    if (this.ring) this.ring.style.transform = `translate(${this.pos.x}px, ${this.pos.y}px) translate(-50%, -50%)`;
    
    requestAnimationFrame(() => this.render());
  }
}

// ==========================================
// BOOTSTRAP APP
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Lenis Smooth Scroll FIRST (desktop only)
  const lenis = LOW_POWER
    ? null
    : new Lenis({
        duration: 0.65,
        easing: (t) => 1 - Math.pow(1 - t, 3),
        smoothWheel: true,
        smoothTouch: false,
        syncTouch: false,
        touchMultiplier: 1,
        wheelMultiplier: 1.15,
        normalizeWheel: true
      });
  
  if (lenis) {
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
  }

  // 2. Start background systems immediately (run behind loader)
  const topo = new TopographicBackground();
  new BackgroundMorph(topo);

  // 3. Start Loader sequence immediately
  initLoader(() => {
    // Once loader finishes, setup the rest:
    if (!IS_TOUCH) {
      new CustomCursor();
    }
    
    // Initialize standard animations (includes ScrollTrigger pinning for horizontal scroll)
    initAnimations();
    initMarqueeLoop();
    
    ScrollTrigger.refresh();
  });
});
