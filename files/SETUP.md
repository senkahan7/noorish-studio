# Noorish Studio — Hero Section Setup

## Folder Structure

Place files in your Vite + React project like this:

```
src/
├── components/
│   └── Hero/
│       ├── Hero.tsx          ← main component + nav
│       ├── HeroScene.tsx     ← R3F canvas scene
│       ├── hero.css          ← grain, typography, layout
│       └── hooks/
│           └── useMouseParallax.ts
public/
└── videos/
    └── showreel.mp4          ← your showreel (≤ 8MB recommended)
```

---

## Required Dependencies

```bash
# Core Three.js / R3F stack
npm install three @react-three/fiber @react-three/drei @react-three/postprocessing

# TypeScript types for Three.js
npm install -D @types/three

# GSAP (standard license covers ScrollTrigger)
npm install gsap @gsap/react

# Lenis smooth scroll (wire up in main.tsx — see below)
npm install lenis
```

> **No GSAP Club required** — `ScrollTrigger` ships with the free GSAP package.
> SplitText is NOT used; chars are split manually in `<SplitChars>`.

---

## Google Fonts — add to `index.html`

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap"
  rel="stylesheet"
/>
```

---

## Lenis Setup (`main.tsx`)

```tsx
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const lenis = new Lenis({
  lerp: 0.08,
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
})

// Sync Lenis with GSAP ScrollTrigger
lenis.on('scroll', ScrollTrigger.update)

gsap.ticker.add((time) => {
  lenis.raf(time * 1000)
})

gsap.ticker.lagSmoothing(0)
```

---

## Usage in your page

```tsx
import Hero from '@/components/Hero/Hero'

export default function App() {
  const scrollToWorks = () => {
    document.getElementById('works')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <main>
      <Hero
        videoSrc="/videos/showreel.mp4"
        onViewWork={scrollToWorks}
      />
      <section id="works">
        {/* Works section */}
      </section>
    </main>
  )
}
```

---

## Tailwind CSS Note

The Hero uses **plain CSS** (hero.css) — NOT Tailwind utility classes.
This is intentional for precision control over complex animations.
You can use Tailwind freely in other sections.

If you want to remove the `hero.css` file and use Tailwind instead,
convert the CSS custom properties to your `tailwind.config.js` theme:

```js
// tailwind.config.js
theme: {
  extend: {
    colors: {
      'hero-bg':   '#080808',
      'hero-text': '#f0ece4',
      'gold':      '#c9a96e',
      'gold-dim':  '#8a6f42',
      'hero-muted':'#6b6660',
    },
    fontFamily: {
      display: ['Syne', 'sans-serif'],
      body:    ['DM Sans', 'sans-serif'],
    }
  }
}
```

---

## Showreel Video Recommendations

| Spec         | Recommended                          |
|--------------|--------------------------------------|
| Format       | `.mp4` (H.264) + `.webm` (VP9) pair  |
| Resolution   | 1280×720 or 1920×1080                |
| File size    | ≤ 8MB (compress with Handbrake)      |
| Duration     | 20–60 seconds, seamless loop         |
| Audio        | Remove audio track entirely           |

For the `<source>` element inside `useVideoTexture`, you just pass the
path string — drei handles the `<video>` element creation internally.

---

## Low-Power Device Detection (Optional)

Install `detect-gpu` to disable the R3F canvas on low-tier devices:

```bash
npm install detect-gpu
```

```tsx
// In Hero.tsx — wrap HeroScene conditionally
import { getGPUTier } from 'detect-gpu'
const [webglEnabled, setWebglEnabled] = useState(true)

useEffect(() => {
  getGPUTier().then((tier) => {
    if (tier.tier < 2) setWebglEnabled(false)
  })
}, [])

// In JSX:
{webglEnabled && (
  <HeroScene videoSrc={videoSrc} scrollProgress={scrollProgress} />
)}
```

---

## Screen Reader / Accessibility

- `<h1>` contains a `<span className="sr-only">Noorish Studio</span>` for
  screen readers — the char-split spans are `aria-hidden="true"`.
- `.hero__canvas` and `.hero__grain` are `aria-hidden="true"`.
- `<section>` has a descriptive `aria-label`.
- Add this utility class to your global CSS:

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```
