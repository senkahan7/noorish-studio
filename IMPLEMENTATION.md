# Noorish Studio - Implementation Guide

## 📋 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🎨 Asset Preparation

### Required Assets (Place in `/public/assets/`)

1. **Hero Depth Map Setup** (`/public/assets/images/`)
   - `hero-image.jpg` - Your main hero image/video frame (1920x1080 recommended)
   - `hero-depth.jpg` - Grayscale depth map (white = close, black = far)
   - `hero-alpha.png` - Alpha mask for subject isolation (white = visible, black = transparent)

2. **Project Videos** (`/public/assets/videos/`)
   - `project-01.mp4` through `project-04.mp4`
   - Recommended: H.264, 1920x1080, optimized for web

3. **Rive Animations** (`/public/assets/rive/`)
   - `logo.riv` - Your animated logo (export from Rive)

### Creating Depth Maps

**Method 1: Photoshop**
1. Duplicate your image layer
2. Desaturate (Image > Adjustments > Desaturate)
3. Adjust levels to create depth gradient (white = foreground, black = background)
4. Blur slightly (Gaussian Blur 2-3px)
5. Save as `hero-depth.jpg`

**Method 2: AI Tools**
- Use tools like DepthAnything or MiDaS to generate depth maps
- Export as grayscale JPG
- Adjust contrast to emphasize depth

### Creating Alpha Maps

1. Select your subject using any selection tool
2. Create layer mask
3. Export mask as PNG with transparency
4. Invert if needed (subject should be white)
5. Save as `hero-alpha.png`

## 🎯 Customization Guide

### Colors (`/src/styles/base.css`)

```css
:root {
    --color-primary: #FF3B3B;     /* Main accent (red) */
    --color-secondary: #0A0E27;   /* Dark blue */
    --color-accent: #00D9FF;      /* Bright cyan */
    --color-bg: #000000;          /* Background */
}
```

### Typography

Update fonts in `/src/styles/base.css`:
```css
--font-display: 'YourDisplayFont', sans-serif;
--font-body: 'YourBodyFont', sans-serif;
```

Import in the `@import` statement at the top.

### Three.js Settings (`/src/js/modules/ThreeScene.js`)

Adjust depth effect strength:
```javascript
uniforms: {
    uDisplacementStrength: { value: 0.3 }, // 0.1 = subtle, 1.0 = extreme
    uRoughnessStrength: { value: 0.5 }     // Material roughness
}
```

### Lenis Scroll Speed (`/src/js/modules/SmoothScroll.js`)

```javascript
this.lenis = new Lenis({
    duration: 1.2,  // Lower = faster, Higher = slower
    // ... other settings
});
```

## 🚀 Performance Optimization

### Texture Optimization

1. **Compress Images**
   - Use tools like TinyPNG or Squoosh
   - Target: < 500KB per image

2. **Video Optimization**
   ```bash
   # Using FFmpeg
   ffmpeg -i input.mp4 -vcodec h264 -crf 28 -preset slow output.mp4
   ```

### GPU Performance Tiers

The site automatically detects GPU capability and adjusts quality. Override in `performance.js`:

```javascript
// Force quality level (development only)
const adaptiveQuality = new AdaptiveQuality();
adaptiveQuality.quality = 'high'; // 'low', 'medium', 'high'
```

### Mobile Optimization

- Custom cursor is automatically disabled on mobile
- Depth map effects reduced on lower-end devices
- Videos lazy-load when scrolled into view

## 🎭 Working with Rive

1. **Create Animation in Rive** (https://rive.app)
   - Design your logo animation
   - Add state machines for interactivity
   - Name your state machine "State Machine 1"

2. **Export**
   - File > Export > .riv
   - Place in `/public/assets/rive/logo.riv`

3. **Custom Interactions** (`/src/js/main.js`)
   ```javascript
   const riveInstance = new Rive({
       src: '/public/assets/rive/logo.riv',
       canvas: canvas,
       autoplay: true,
       stateMachines: 'YourStateMachineName'
   });
   
   // Trigger events
   riveInstance.play('AnimationName');
   ```

## 🎨 Adding New Work Items

Edit `index.html`:

```html
<article class="work-item work-item--large" data-mask="ellipse">
    <div class="work-media">
        <video class="work-video" muted loop playsinline>
            <source src="/public/assets/videos/your-video.mp4" type="video/mp4">
        </video>
        <div class="work-overlay">
            <h3 class="work-title">Project Name</h3>
            <p class="work-category">Category</p>
        </div>
    </div>
</article>
```

**Mask Options** (set in `data-mask` attribute):
- `ellipse` - Oval shape
- `polygon` - Hexagon
- `custom` - Octagon
- `circle` - Circle

**Size Options** (add class):
- `work-item--large` - Takes 2 grid columns
- `work-item--medium` - Takes 1 grid column (default)

## 🔧 Advanced Customizations

### Custom Clip-Path Masks

Add to `/src/js/modules/MaskedShapes.js`:

```javascript
const masks = {
    yourCustomMask: {
        initial: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)',
        hover: 'polygon(10% 0%, 90% 0%, 100% 100%, 0% 100%)',
        large: 'polygon(15% 0%, 85% 0%, 100% 100%, 0% 100%)'
    }
};
```

Use: `data-mask="yourCustomMask"`

### Custom Text Animations

Add to `/src/js/modules/TextAnimations.js`:

```javascript
// Example: Wave effect
animateWave(element) {
    const letters = element.querySelectorAll('.letter');
    gsap.to(letters, {
        y: -20,
        stagger: {
            each: 0.05,
            from: 'start',
            repeat: -1,
            yoyo: true
        },
        duration: 0.5,
        ease: 'sine.inOut'
    });
}
```

### Horizontal Scroll Sections

Add sections in `index.html` and they'll auto-scroll horizontally.

The pinning and scrolling is handled by GSAP ScrollTrigger in `/src/js/modules/SmoothScroll.js`.

## 🐛 Troubleshooting

### Issue: Black screen / Three.js not loading
- Check console for texture loading errors
- Ensure image paths are correct
- Verify images are in `/public/assets/images/`

### Issue: Videos not playing
- Check video codec (should be H.264)
- Ensure autoplay is allowed in browser
- Test with smaller file sizes

### Issue: Slow performance
- Reduce `uDisplacementStrength` in ThreeScene.js
- Compress textures further
- Check GPU tier detection in console

### Issue: Curtain loader stuck
- Clear browser cache
- Check for JavaScript errors in console
- Ensure GSAP is loaded correctly

## 📱 Browser Support

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support (iOS 14+)
- Mobile browsers: ✅ Optimized experience

## 🎯 Next Steps

1. Replace placeholder assets with your own
2. Customize colors and typography
3. Add your project videos
4. Create Rive animations
5. Test on different devices
6. Deploy to Vercel/Netlify

## 📚 Resources

- [Three.js Documentation](https://threejs.org/docs/)
- [GSAP Documentation](https://greensock.com/docs/)
- [Lenis Documentation](https://github.com/studio-freight/lenis)
- [Rive Documentation](https://help.rive.app/)
- [Depth Map Tutorial](https://www.youtube.com/watch?v=example)

---

Built with ❤️ for Noorish Studio
