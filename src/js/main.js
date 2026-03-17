import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ==========================================
// 1. LOADER ANIMATION
// ==========================================
function initLoader(onComplete) {
  const loader = document.getElementById('loader');
  const number = document.getElementById('countdownNumber');
  const barFill = document.getElementById('loaderBar');
  const circle = document.querySelector('.countdown-circle');
  const textSpans = document.querySelectorAll('.loader-logo-text span');
  const tagline = document.querySelector('.loader-tagline');
  
  if (!loader) return onComplete();

  // Reset states
  gsap.set(textSpans, { opacity: 0, y: 20 });
  gsap.set(tagline, { opacity: 0 });
  
  const tl = gsap.timeline({
    onComplete: () => {
      gsap.to(loader, {
        yPercent: -100,
        duration: 0.8,
        ease: 'power4.inOut',
        onComplete: () => {
          loader.style.display = 'none';
          onComplete();
        }
      });
    }
  });

  // Circle countdown animation
  tl.to(circle, {
    strokeDashoffset: 0,
    duration: 2,
    ease: 'power2.inOut',
    onUpdate: function() {
      // Countdown from 5 to 1
      const prog = this.progress();
      const val = Math.max(1, Math.ceil(5 - (prog * 5)));
      if (number) number.innerText = val;
    }
  }, 0);

  // Bar fill
  if (barFill) {
    tl.to(barFill, { width: '100%', duration: 2, ease: 'power2.inOut' }, 0);
  }

  // Text reveal
  tl.to(textSpans, {
    opacity: 1,
    y: 0,
    duration: 0.5,
    stagger: 0.05,
    ease: 'back.out(1.5)'
  }, 0.5);

  tl.to(tagline, {
    opacity: 1,
    duration: 0.5
  }, 1.2);
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
    
    // Look up table for marching squares based on 4 corners crossing thresholds
    this.edgeTable = [
      [], [[0, 3]], [[0, 1]], [[1, 3]], [[1, 2]], [[0, 1], [2, 3]], [[0, 2]], [[2, 3]],
      [[2, 3]], [[0, 2]], [[0, 3], [1, 2]], [[1, 2]], [[1, 3]], [[0, 1]], [[0, 3]], []
    ];
    
    this.thresholds = [-2.4, -1.6, -0.8, 0, 0.8, 1.6, 2.4]; 
    this.cellSize = 18; // Higher resolution for smoother segments

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());
    window.addEventListener('mousemove', (e) => {
      this.mouse.targetX = e.clientX;
      this.mouse.targetY = e.clientY;
    });

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
  }

  setTheme(isDark) {
    this.isDark = !!isDark;
  }

  getValue(x, y, t, mouseX, mouseY) {
    let dx = x - mouseX;
    let dy = y - mouseY;
    let dist = Math.sqrt(dx*dx + dy*dy);
    
    // Smooth mouse repulsion effect
    let pushX = 0;
    let pushY = 0;
    if (dist < 420 && dist > 0) {
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

  render() {
    this.time += 0.005;
    
    // Smooth mouse target follow
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.05;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.05;

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

    // Morph light-theme colors for sections as the background changes
    const isDark = bgType === 'dark' || bgType === 'gradient';
    const lightVars = isDark
      ? {
          '--light-text': '#f5f5f0',
          '--light-dim': 'rgba(245, 245, 240, 0.6)',
          '--light-number': '#E879F9',
          '--light-tag': '#E879F9',
          '--light-border': 'rgba(217, 70, 239, 0.4)',
          '--light-marker-bg': '#000000',
          '--light-marker-text': '#E879F9',
          '--light-marker-border': 'rgba(217, 70, 239, 0.2)',
          '--light-card-bg': 'rgba(255, 255, 255, 0.06)',
          '--light-card-border': 'rgba(245, 245, 240, 0.18)',
          '--light-card-shadow': '0 18px 50px rgba(0, 0, 0, 0.45)'
        }
      : {
          '--light-text': '#1a1a1a',
          '--light-dim': 'rgba(26, 26, 26, 0.5)',
          '--light-number': '#A21CAF',
          '--light-tag': '#A21CAF',
          '--light-border': 'rgba(217, 70, 239, 0.4)',
          '--light-marker-bg': '#1a1a1a',
          '--light-marker-text': '#E879F9',
          '--light-marker-border': 'transparent',
          '--light-card-bg': 'rgba(0, 0, 0, 0.04)',
          '--light-card-border': 'rgba(0, 0, 0, 0.08)',
          '--light-card-shadow': '0 12px 40px rgba(0, 0, 0, 0.08)'
        };

    gsap.to(document.body, {
      ...lightVars,
      duration: 0.9,
      ease: 'power2.out',
      overwrite: 'auto'
    });
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
  if (gallery) {
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
  gsap.to('.hero-services-tags', { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1, delay: 1 });

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

    const updateFilmstrip = () => {
      const maxOffset = Math.max(filmstripTrack.scrollWidth - filmstripWrapper.clientWidth, 0);
      filmstripOffset = Math.max(0, Math.min(filmstripOffset, maxOffset));
      filmstripTrack.style.transform = `translateX(-${filmstripOffset}px)`;
    };

    updateFilmstrip();
    window.addEventListener('resize', updateFilmstrip);

    worksNavButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const direction = btn.dataset.dir === 'next' ? 1 : -1;
        const step = filmstripWrapper.clientWidth * 0.85;
        filmstripOffset += direction * step;
        updateFilmstrip();
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
  document.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 2;
    const y = (e.clientY / window.innerHeight - 0.5) * 2;
    vectors.forEach((vec, i) => {
      const factor = (i + 1) * 5;
      gsap.to(vec, { x: x * factor, y: y * factor, rotation: x * 3, duration: 2, ease: 'power2.out' });
    });
  });
}

// ==========================================
// 4.5 TESTIMONIALS MARQUEE LOOP
// ==========================================
function initMarqueeLoop() {
  const track = document.querySelector('.marquee-track');
  if (!track || track.dataset.looped === 'true') return;

  const items = Array.from(track.children);
  if (items.length === 0) return;

  const fragment = document.createDocumentFragment();
  items.forEach((item) => {
    const clone = item.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    fragment.appendChild(clone);
  });
  track.appendChild(fragment);

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
  // 1. Initialize Lenis Smooth Scroll FIRST
  const lenis = new Lenis({
    duration: 0.65,
    easing: (t) => 1 - Math.pow(1 - t, 3),
    smoothWheel: true,
    smoothTouch: true,
    syncTouch: true,
    touchMultiplier: 1.25,
    wheelMultiplier: 1.15,
    normalizeWheel: true
  });
  
  // Connect Lenis to ScrollTrigger
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000); // Important for lenis tick
  });
  gsap.ticker.lagSmoothing(0); // Prevents GSAP lag from skipping frames

  // 2. Start background systems immediately (run behind loader)
  const topo = new TopographicBackground();
  new BackgroundMorph(topo);

  // 3. Start Loader sequence immediately
  initLoader(() => {
    // Once loader finishes, setup the rest:
    new CustomCursor();
    
    // Initialize standard animations (includes ScrollTrigger pinning for horizontal scroll)
    initAnimations();
    initMarqueeLoop();
    
    ScrollTrigger.refresh();
  });
});
