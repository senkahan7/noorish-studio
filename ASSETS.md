# Asset Preparation Guide for Noorish Studio

## 🎨 Required Assets Overview

This guide will help you prepare all the assets needed for your portfolio website.

## 1. Hero Section Assets

### Main Hero Image (`hero-image.jpg`)
- **Dimensions**: 1920x1080px (16:9 ratio)
- **Format**: JPG
- **Size**: < 500KB (compressed)
- **Content**: Your signature work, best video frame, or brand image
- **Tips**: 
  - High contrast works best for depth mapping
  - Avoid motion blur
  - Clear subject separation from background

### Depth Map (`hero-depth.jpg`)
- **Dimensions**: Same as hero-image.jpg (1920x1080px)
- **Format**: JPG (grayscale)
- **Size**: < 200KB
- **Content**: Depth information (white = close, black = far)

**How to Create:**

**Option A: Manual (Photoshop/GIMP)**
1. Open your hero image
2. Duplicate layer
3. Convert to grayscale: Image > Adjustments > Desaturate
4. Paint white on subjects that should appear closer
5. Paint black on distant elements (background)
6. Use gray for mid-depth areas
7. Apply Gaussian Blur (2-3px) for smooth transitions
8. Save as `hero-depth.jpg`

**Option B: AI-Generated**
Use online tools:
- https://huggingface.co/spaces/LiheYoung/Depth-Anything
- https://replicate.com/stability-ai/depth-anything-v2

Upload your image → Download the depth map → Adjust contrast if needed

### Alpha Map (`hero-alpha.png`)
- **Dimensions**: Same as hero-image.jpg (1920x1080px)
- **Format**: PNG with transparency
- **Size**: < 300KB
- **Content**: Subject isolation mask

**How to Create:**
1. Open hero image in Photoshop
2. Use Quick Selection or Magic Wand to select subject
3. Refine edge: Select > Select and Mask
4. Create layer mask from selection
5. Right-click mask > Apply Layer Mask
6. Delete background layer
7. Invert if needed (subject should be white/visible)
8. Save as PNG: `hero-alpha.png`

### Example Structure:
```
hero-image.jpg  → [Your video editing workspace / signature shot]
hero-depth.jpg  → [White on desk/computer, gray on you, black on background]
hero-alpha.png  → [Transparent background, solid subject]
```

## 2. Project Videos

### Video Requirements
- **Count**: 4 videos minimum
- **Format**: MP4 (H.264 codec)
- **Dimensions**: 1920x1080px or 1280x720px
- **Duration**: 10-30 seconds (loop-friendly)
- **Size**: < 5MB per video
- **Naming**: 
  - `project-01.mp4`
  - `project-02.mp4`
  - `project-03.mp4`
  - `project-04.mp4`

### Compression (Using FFmpeg)
```bash
# High quality, web-optimized
ffmpeg -i input.mp4 -vcodec h264 -crf 23 -preset slow -an output.mp4

# Smaller file size
ffmpeg -i input.mp4 -vcodec h264 -crf 28 -preset slow -an output.mp4

# With audio
ffmpeg -i input.mp4 -vcodec h264 -acodec aac -b:a 128k -crf 23 output.mp4
```

### Online Compression Tools
- https://www.freeconvert.com/video-compressor
- https://www.videosmaller.com/
- https://handbrake.fr/ (Desktop app)

**Tips:**
- Remove audio if not needed (saves 30-50% file size)
- Use seamless loops for better UX
- Test autoplay on mobile devices
- Consider creating a poster frame (first frame as JPG)

## 3. Rive Animations (Optional but Recommended)

### Logo Animation (`logo.riv`)
- **Dimensions**: 200x200px artboard
- **Format**: .riv (Rive file)
- **Size**: < 100KB
- **Animation**: 2-3 second loop

**How to Create:**
1. Sign up at https://rive.app (free)
2. Create new file (200x200px)
3. Import your logo as SVG or recreate it
4. Add animations:
   - Idle state (subtle breathing/rotation)
   - Hover state (expand/glow)
   - Click state (bounce/spin)
5. Create State Machine named "State Machine 1"
6. Export as .riv file

**Tutorials:**
- https://rive.app/community/doc/getting-started
- https://www.youtube.com/c/RiveApp

## 4. Additional Assets (Optional)

### SVG Masks (`/public/assets/masks/`)
Custom clip-path SVGs for unique shapes
- Format: SVG
- Example: `custom-mask-01.svg`

### Texture Overlays
- Grain texture: 512x512px PNG
- Noise overlay: 1024x1024px PNG
- Gradient maps: SVG or PNG

## 📁 Final Folder Structure

```
/public/assets/
├── images/
│   ├── hero-image.jpg      (1920x1080, < 500KB)
│   ├── hero-depth.jpg      (1920x1080, < 200KB)
│   └── hero-alpha.png      (1920x1080, < 300KB)
├── videos/
│   ├── project-01.mp4      (< 5MB)
│   ├── project-02.mp4      (< 5MB)
│   ├── project-03.mp4      (< 5MB)
│   └── project-04.mp4      (< 5MB)
├── rive/
│   └── logo.riv            (< 100KB)
└── masks/                  (optional)
    └── custom-mask-01.svg
```

## 🎯 Quality Checklist

Before adding assets to your site:

### Images
- [ ] Compressed to < 500KB
- [ ] Correct dimensions (1920x1080)
- [ ] Converted to web-friendly format (JPG/PNG)
- [ ] Tested for quality at 1x and 2x display

### Videos
- [ ] H.264 codec
- [ ] Under 5MB per video
- [ ] Tests autoplay in Chrome/Safari
- [ ] Seamless loop (if applicable)
- [ ] Muted (for autoplay compatibility)

### Depth Maps
- [ ] Grayscale only
- [ ] Clear depth separation
- [ ] Smooth gradients (no harsh edges)
- [ ] Same dimensions as source image

### Alpha Maps
- [ ] Transparent background
- [ ] Clean edges
- [ ] PNG format with alpha channel
- [ ] Same dimensions as source image

## 🛠️ Recommended Tools

**Free:**
- GIMP (Photoshop alternative)
- Photopea (Browser-based editor)
- FFmpeg (Video processing)
- Squoosh (Image compression)
- Rive (Animation)

**Paid:**
- Adobe Photoshop
- Adobe Premiere Pro
- DaVinci Resolve
- After Effects

## 💡 Pro Tips

1. **Depth Maps**: More contrast = more dramatic parallax effect
2. **Videos**: Short, looping clips work better than long narratives
3. **File Sizes**: Smaller is always better for web performance
4. **Testing**: Preview on multiple devices before launch
5. **Backup**: Keep high-resolution originals separate from web assets

## 🆘 Need Help?

If you're stuck on creating any of these assets:
1. Check the implementation guide (`IMPLEMENTATION.md`)
2. Use the provided examples in the project
3. Test with placeholder assets first
4. Hire a designer on Fiverr/Upwork for professional assets

---

**Remember**: The quality of your assets directly impacts the final look. Invest time in creating clean depth maps and optimized videos for the best results!
