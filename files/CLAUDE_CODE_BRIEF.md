# NOORISH STUDIO — HERO INTEGRATION BRIEF
# For: Claude Code (Claude Code CLI / Agent)
# Project: React + Vite portfolio at https://noorishportfolio.netlify.app/
# Task: Integrate a pre-built cinematic hero section into the existing codebase

---

## CONTEXT — READ THIS FIRST

This is a video editing / motion design portfolio for "Noorish Studio".
I have already designed and built a premium cinematic hero section from scratch.
Your job is ONLY to integrate these pre-built files into the existing project.

DO NOT redesign, restyle, or rewrite any of the code I give you.
DO NOT touch any section other than the hero.
DO NOT change fonts, colors, or animation values.
DO NOT simplify or "clean up" the R3F or GSAP code — it is intentional.

---

## PHASE 1 — INSPECT THE PROJECT FIRST (do this before touching anything)

Run these commands and read the output carefully before making any changes:

```bash
# Understand the full project structure
find src -type f | sort

# Check what's currently in package.json
cat package.json

# Check the current main entry point
cat src/main.tsx

# Check the current App or index component
cat src/App.tsx

# Find any existing hero component
find src -iname "*hero*" | sort

# Find the current CSS entry point
find src -name "*.css" | head -20

# Check tailwind config
cat tailwind.config.js 2>/dev/null || cat tailwind.config.ts 2>/dev/null

# Check vite config (important for path aliases)
cat vite.config.ts 2>/dev/null || cat vite.config.js 2>/dev/null

# Check tsconfig for path aliases
cat tsconfig.json
```

Do not proceed until you have read all of this output.

---

## PHASE 2 — INSTALL MISSING DEPENDENCIES

Check package.json. Install only what is missing:

```bash
# Check what's already installed first:
cat package.json | grep -E "three|fiber|drei|postprocessing|gsap|lenis"

# Then install only what's not already present:
npm install three @react-three/fiber @react-three/drei @react-three/postprocessing
npm install gsap @gsap/react
npm install lenis
npm install -D @types/three
```

If any of these are already installed, skip them. Do not upgrade existing packages.

---

## PHASE 3 — FILE PLACEMENT

I am providing you with these files. Place them EXACTLY as shown:

```
src/
└── components/
    └── Hero/                          ← create this folder
        ├── Hero.tsx                   ← main hero component
        ├── HeroScene.tsx              ← React Three Fiber canvas
        ├── hero.css                   ← all hero styles (do not merge into global)
        └── hooks/
            └── useMouseParallax.ts    ← custom mouse parallax hook
```

Also create this in /public:
```
public/
└── videos/
    └── showreel.mp4                   ← PLACEHOLDER — create an empty file for now
                                          (user will replace with real video later)
```

Create the placeholder with: `touch public/videos/showreel.mp4`

---

## PHASE 4 — FIX IMPORT PATHS

After placing the files, fix all import paths to match the actual project structure.

The files reference:
  - `'../hooks/useMouseParallax'`  → should resolve to `src/components/Hero/hooks/useMouseParallax.ts`
  - `'./HeroScene'`                → should resolve to `src/components/Hero/HeroScene.tsx`
  - `'./hero.css'`                 → should resolve to `src/components/Hero/hero.css`

Check if the project uses path aliases (like `@/`) in tsconfig.json and vite.config.ts.
If `@/` maps to `src/`, update the imports to use it:
  - `import { useMouseParallax } from '@/components/Hero/hooks/useMouseParallax'`
  - etc.

If no path alias exists, use relative paths. Do not add a new alias unless one already exists.

---

## PHASE 5 — FIND AND REPLACE THE EXISTING HERO

1. Find the current hero section. It might be:
   - A component at `src/components/Hero.tsx` or similar
   - Directly inside `src/App.tsx` or `src/pages/index.tsx`
   - A section with id="hero" or className containing "hero"

2. Find where the hero is currently rendered in the component tree.

3. Replace that render location with the new Hero import:

```tsx
import Hero from '@/components/Hero/Hero'
// or: import Hero from './components/Hero/Hero'

// Replace whatever is currently the hero with:
<Hero
  videoSrc="/videos/showreel.mp4"
  onViewWork={() => {
    document.getElementById('works')?.scrollIntoView({ behavior: 'smooth' })
  }}
/>
```

4. Remove the old hero component file ONLY if it is no longer imported anywhere.
   Run: `grep -r "OldHeroComponentName" src/` to confirm before deleting.

---

## PHASE 6 — CSS CONFLICT RESOLUTION

The new hero uses a dedicated `hero.css` file with these class names:
  .hero, .hero__canvas, .hero__grain, .hero__vignette, .hero__content,
  .hero__eyebrow, .hero__title, .hero__subtitle, .hero__cta, .hero__scroll,
  .hero__nav, .hero__nav-logo, .hero__nav-links

Check for conflicts:

```bash
# Search for any existing CSS that uses these class names
grep -r "\.hero" src/ --include="*.css" --include="*.scss"
grep -r "hero__" src/ --include="*.css" --include="*.scss"
```

If conflicts are found:
  - Rename conflicting classes in the OLD code, not the new hero.css
  - Do not edit hero.css

Also check for global styles that might affect:
  - `h1` font-size or font-family (hero.css uses font-family on .hero__title, but
    a global h1 rule could override it — add specificity: `.hero .hero__title`)
  - `button` styles that might override .hero__cta
  - Any `* { margin: 0 }` or box-sizing resets — these are fine and expected

---

## PHASE 7 — LENIS SMOOTH SCROLL SETUP

Check if Lenis is already configured in main.tsx or App.tsx.

If NOT configured, add this to `src/main.tsx` (or wherever the app bootstraps):

```tsx
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// Initialize Lenis
const lenis = new Lenis({
  lerp: 0.08,
  duration: 1.2,
  easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
})

// Sync Lenis scroll events with GSAP ScrollTrigger
lenis.on('scroll', ScrollTrigger.update)

gsap.ticker.add((time) => {
  lenis.raf(time * 1000)
})

gsap.ticker.lagSmoothing(0)
```

If Lenis IS already configured, leave it alone. Just make sure GSAP ScrollTrigger
is registered: `gsap.registerPlugin(ScrollTrigger)`

---

## PHASE 8 — GOOGLE FONTS

Check if `index.html` already loads Syne and DM Sans fonts.

```bash
grep -i "syne\|dm.sans" index.html
```

If NOT found, add these to the `<head>` in `index.html`, BEFORE the closing `</head>`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap"
  rel="stylesheet"
/>
```

If Syne or DM Sans are already loaded, do not add duplicates.
If the project uses a different font loading method (Fontsource, etc.), note it but do not change it — the CSS variables will adapt.

---

## PHASE 9 — SCREEN READER UTILITY CLASS

Add this to the project's global CSS file (usually `src/index.css` or `src/globals.css`).
Only add if `.sr-only` is not already defined:

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

---

## PHASE 10 — VERIFY THE BUILD

```bash
# Check for TypeScript errors
npx tsc --noEmit

# Start dev server and confirm no errors
npm run dev
```

Fix any TypeScript or import errors. Common issues to watch for:

1. `Cannot find module 'three'` → run `npm install three @types/three`
2. `Cannot find module '@react-three/postprocessing'` → install it
3. `Property 'mipmapBlur' does not exist` → this is on Bloom from @react-three/postprocessing
   v2.x. If using v1.x, remove `mipmapBlur` from the Bloom props in HeroScene.tsx
4. `useGSAP is not a function` → make sure `@gsap/react` is installed
   Hero.tsx uses plain `useEffect` with `gsap.context()` — no `useGSAP` import needed
5. `Type error on Canvas gl prop` → acceptable, add `// @ts-ignore` above the `gl` prop
   if the Three.js types don't align with the installed version

---

## WHAT NOT TO TOUCH

- Do NOT change any section after the hero (Works, Services, Gallery, Contact, Footer)
- Do NOT modify hero.css values (colors, font sizes, animation timings)
- Do NOT change HeroScene.tsx camera positions, bloom settings, or plane geometry
- Do NOT remove the film grain or vignette overlays
- Do NOT swap out Syne/DM Sans for the existing project fonts
- Do NOT convert hero.css to Tailwind utility classes
- Do NOT add any new routing, state management, or context providers

---

## DESIGN CONTEXT (read so you understand WHY things are built this way)

This hero was designed as part of a full cinematic redesign of the portfolio.
The aesthetic direction is "Analog Luxury" — A24 films meets a high-end production house.

Key intentional decisions:
  - hero.css is intentionally NOT Tailwind — precision CSS is needed for complex
    GSAP clip-path animations, film grain pseudo-elements, and perspective transforms
  - The R3F canvas uses a SHARED scrollProgress ref (not React state) so the
    camera push happens at 60fps without any re-renders
  - The mouse parallax hook returns refs, not state — same reason
  - The CameraRig and VideoPlane are separate components inside the Canvas so each
    can have its own useFrame without them conflicting
  - The Bloom FrameGlow is a separate plane mesh behind the video — bloom works on
    emissive materials, and adding emissive to the video plane would wash out the video
  - The hero is pinned for 120vh of scroll — this gives a cinematic "push into the
    scene" before any other section appears

---

## FINAL CHECKLIST

Before calling this done, verify:
  [ ] npm run dev starts with no errors
  [ ] npx tsc --noEmit passes (or only has pre-existing errors from before this change)
  [ ] Hero renders full-screen at top of page
  [ ] "N" logo mark visible top-left in nav
  [ ] Nav links visible top-right
  [ ] Title "Noorish Studio" appears (even if video is empty/blank — that's fine for now)
  [ ] Subtitle and "View Work" CTA appear below title
  [ ] "Scroll" indicator visible bottom-right
  [ ] No console errors about missing modules
  [ ] No CSS class name collisions with other sections
  [ ] Other sections (Works, Gallery, etc.) still render correctly below the hero
