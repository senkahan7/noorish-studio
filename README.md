# Noorish Studio - Portfolio Website

A world-class, immersive video editing portfolio website with advanced 3D effects and smooth animations.

## Features

- **Immersive 3D Hero**: Three.js depth-mapped parallax with alpha and roughness maps
- **Smooth Scrolling**: Lenis library for buttery-smooth scrolljacking
- **Non-Standard Layouts**: SVG masking and clip-path animations
- **Advanced Typography**: Staggered letter animations
- **Seamless Transitions**: Custom curtain page loader
- **Interactive Graphics**: Rive animations integration
- **Performance First**: 60fps with CSS transforms only

## Tech Stack

- Three.js (3D rendering)
- Lenis (smooth scroll)
- GSAP (animations)
- Rive (interactive graphics)
- Vanilla JS (performance)
- Vite (build tool)

## Folder Structure

```
noorish-studio/
├── public/
│   ├── assets/
│   │   ├── images/
│   │   │   ├── hero-image.jpg
│   │   │   ├── hero-depth.jpg
│   │   │   └── hero-alpha.png
│   │   ├── videos/
│   │   ├── rive/
│   │   └── masks/
│   └── favicon.ico
├── src/
│   ├── js/
│   │   ├── modules/
│   │   │   ├── ThreeScene.js
│   │   │   ├── SmoothScroll.js
│   │   │   ├── PageLoader.js
│   │   │   ├── TextAnimations.js
│   │   │   └── MaskedShapes.js
│   │   ├── utils/
│   │   │   └── performance.js
│   │   └── main.js
│   ├── styles/
│   │   ├── base.css
│   │   ├── components.css
│   │   └── animations.css
│   └── shaders/
│       ├── vertex.glsl
│       └── fragment.glsl
├── index.html
├── package.json
└── vite.config.js
```

## Installation

```bash
npm install
npm run dev
```

## Performance Optimization

- All animations use CSS transforms
- No expensive filters, blurs, or gradients
- GPU-accelerated rendering
- Optimized texture loading
- 60fps target on modern devices
"# portfolio" 
