# 🎨 Image Generation Guide for Noorish Studio

## Quick Start: Using the Placeholder Images

I've created SVG placeholders you can use immediately to test the site. Convert them to the required formats:

### Option 1: Online Conversion (Easiest)
1. Go to https://cloudconvert.com/svg-to-jpg
2. Upload `hero-image-placeholder.svg` → Convert to JPG
3. Upload `hero-depth-placeholder.svg` → Convert to JPG  
4. Upload `hero-alpha-placeholder.svg` → Convert to PNG
5. Rename files:
   - `hero-image-placeholder.jpg` → `hero-image.jpg`
   - `hero-depth-placeholder.jpg` → `hero-depth.jpg`
   - `hero-alpha-placeholder.png` → `hero-alpha.png`

### Option 2: Using Image Editing Software
1. Open each SVG in Photoshop/GIMP/Figma
2. Resize canvas to 1920x1080px
3. Export as JPG (hero-image, hero-depth) or PNG (hero-alpha)

---

## AI Image Generation Prompts

### 🎬 For Noorish Studio (Video Editing Theme)

#### Hero Image - Option 1: Workspace Setup

**Midjourney/DALL-E 3 Prompt:**
```
A cinematic photograph of a professional video editor's workspace, shot from a 45-degree elevated angle. Two 27-inch 4K monitors displaying Adobe Premiere Pro timeline with vibrant color grading (reds and cyans). Sleek black desk with carbon fiber texture. Mechanical keyboard with RGB backlighting glowing in red and cyan. Professional audio interface, color grading panel, and high-end mouse visible. Dark moody studio lighting with the monitors as the primary light source creating dramatic rim lighting. Racing-inspired aesthetic with premium materials. Shallow depth of field (f/2.8), bokeh background showing subtle studio equipment. Ultra-detailed, 8K photography, cinematic color grading, professional product photography style. Color palette: deep blacks (#000000), vibrant red (#FF3B3B), bright cyan (#00D9FF), dark blue accents (#0A0E27).
```

**Simpler version:**
```
Professional video editing workspace, dual monitors with Premiere Pro, dark studio lighting, red and cyan RGB keyboard, motorsport aesthetic, cinematic photography, f/2.8, 8K --ar 16:9 --style raw
```

#### Hero Image - Option 2: Action/Narrative

**Prompt:**
```
Cinematic behind-the-scenes shot of a video editor working late at night, hands on color grading panel, multiple monitors showing racing footage being edited, dramatic rim lighting from monitors casting red and cyan light, professional editing bay, shallow depth of field, bokeh lights in background, motorsport atmosphere, editorial photography, 8K --ar 16:9 --v 6
```

#### Hero Image - Option 3: Abstract/Artistic

**Prompt:**
```
Abstract minimalist composition representing video editing: floating timeline scrubbers, color wheels, and waveforms arranged artistically against a dark background. Gradient lighting from deep red to bright cyan. Premium 3D render, glass and metallic materials, subsurface scattering, octane render, ultra high resolution, motorsport-inspired design language --ar 16:9
```

---

### 🎨 Depth Map Generation

**Option A: AI Tools (Recommended)**

Use these free online tools to generate depth maps from your hero image:

1. **Depth Anything V2** (Best quality)
   - https://huggingface.co/spaces/depth-anything/Depth-Anything-V2
   - Upload your hero image
   - Download the depth map
   - Adjust contrast in Photoshop if needed

2. **MiDaS Depth Estimation**
   - https://replicate.com/cjwbw/midas
   - Fast and accurate
   - Good for real photos

3. **ZoeDepth**
   - https://huggingface.co/spaces/shariqfarooq/ZoeDepth
   - High resolution output

**Option B: Manual Creation in Photoshop**

1. Open your hero image
2. Duplicate layer
3. Image → Adjustments → Desaturate
4. Use Brush tool (soft, white) to paint areas that should be CLOSE
5. Use Brush tool (soft, black) to paint areas that should be FAR
6. Layers to adjust:
   - **Pure white (255)**: Keyboard, mouse, closest objects
   - **Light gray (200)**: Monitors, desk surface
   - **Medium gray (128)**: Mid-ground equipment
   - **Dark gray (64)**: Background wall items
   - **Black (0)**: Far background wall
7. Filter → Blur → Gaussian Blur (2-3px) for smooth transitions
8. Save as `hero-depth.jpg`

**Midjourney Prompt for Depth Map (if generating from scratch):**
```
Grayscale depth map for video editing workspace scene, white elements in foreground (keyboard, mouse), light gray monitors and desk, medium gray background equipment, black far wall, smooth gradients, gaussian blur, professional depth map for 3D parallax, monochrome --ar 16:9 --style raw --no color
```

---

### 🎭 Alpha Map Generation

**Option A: Automatic Background Removal**

1. **Remove.bg** (Free, easiest)
   - https://www.remove.bg/
   - Upload hero image
   - Download PNG with transparent background
   - Invert in Photoshop if needed (subject should be white)

2. **Photoshop (AI-powered)**
   - Open hero image
   - Select → Subject (AI selects automatically)
   - Select → Select and Mask → Refine edges
   - Layer → Layer Mask → From Selection
   - Right-click mask → Apply Layer Mask
   - Delete background layer
   - Ensure subject is white/opaque, background is black/transparent
   - Save as PNG: `hero-alpha.png`

**Option B: Manual Creation**

1. Open hero image in Photoshop
2. Use Quick Selection Tool or Magic Wand
3. Select all objects (monitors, desk, equipment)
4. Create layer mask from selection
5. Apply mask
6. Delete background
7. Invert if needed (solid objects = white, empty space = black)
8. File → Export → PNG → Check "Transparency"

---

## 🎯 AI Image Generator Tool Recommendations

### Best Tools for This Project:

1. **Midjourney** (Paid, $10/month)
   - Best quality for photographic images
   - Great at understanding "cinematic" and "editorial" photography
   - Use: `/imagine [prompt] --ar 16:9 --style raw --v 6`

2. **DALL-E 3** (Free via Bing Image Creator)
   - https://www.bing.com/images/create
   - Good at following detailed prompts
   - Free to use

3. **Leonardo AI** (Free tier available)
   - https://leonardo.ai/
   - Great for stylized workspace photography
   - PhotoReal model works well

4. **Stable Diffusion** (Free, requires setup)
   - https://stablediffusionweb.com/
   - Fully free
   - More technical setup

### Prompting Tips:

**For Hero Image:**
- Start with: "Cinematic photograph of..."
- Include: lighting description, color palette, camera settings
- Add: "8K, ultra detailed, professional photography"
- Specify: "motorsport aesthetic" or "racing-inspired"
- Use: `--ar 16:9` for correct aspect ratio

**For Better Results:**
- Be specific about colors: mention #FF3B3B (red) and #00D9FF (cyan)
- Request "shallow depth of field" for professional look
- Include "rim lighting" or "dramatic lighting"
- Ask for "premium materials" and "high-end equipment"

---

## 📐 Technical Specifications

### Hero Image (`hero-image.jpg`)
- **Dimensions**: 1920 x 1080 pixels (16:9)
- **Format**: JPG
- **Color Profile**: sRGB
- **Quality**: 85-90% (keep under 500KB)
- **Content**: Should have clear foreground and background separation

### Depth Map (`hero-depth.jpg`)
- **Dimensions**: 1920 x 1080 pixels (must match hero-image)
- **Format**: JPG
- **Color**: Grayscale only (no color)
- **Quality**: 80% (keep under 200KB)
- **Gradient**: Smooth, blurred edges
- **Values**: White (255) = closest, Black (0) = farthest

### Alpha Map (`hero-alpha.png`)
- **Dimensions**: 1920 x 1080 pixels (must match hero-image)
- **Format**: PNG with transparency
- **Color**: Binary (pure white or pure black)
- **Edges**: Slight feather (2-3px) for clean cutout
- **Content**: White = visible subject, Black = transparent background

---

## 🎬 Alternative Themes for Hero Images

If you want to explore different directions:

### Option 1: Motorsport Focus
```
Cinematic shot of a race car detail, carbon fiber texture, red and cyan reflections, premium automotive photography, studio lighting, 8K --ar 16:9
```

### Option 2: Speed/Motion
```
Abstract motion blur of racing stripes in red and cyan, speed lines, metallic surfaces, dynamic composition, premium design, dark background --ar 16:9
```

### Option 3: Minimalist/Clean
```
Minimalist composition of editing timeline interface elements floating in space, glass morphism, red and cyan gradient lighting, dark background, 3D render --ar 16:9
```

### Option 4: Atmospheric
```
Moody cinematic atmosphere, smoke and volumetric lighting, editing equipment silhouettes, red and cyan accent lights, film noir style, ultra detailed --ar 16:9
```

---

## 🚀 Quick Action Plan

**Immediate (Use Placeholders):**
1. Convert the 3 placeholder SVGs I created to JPG/PNG
2. Test the site with these placeholders
3. See how the depth effect works

**Short Term (AI Generation):**
1. Go to Bing Image Creator (free)
2. Use the hero image prompts above
3. Generate 3-4 variations
4. Pick your favorite
5. Use Depth Anything to create depth map
6. Use Remove.bg for alpha mask

**Long Term (Professional):**
1. Take your own workspace photos
2. Create custom depth maps in Photoshop
3. Professional alpha masking
4. Or hire a photographer/retoucher on Fiverr ($20-50)

---

## 💡 Pro Tips

1. **Test First**: Use the placeholders to see if you like the effect before investing time
2. **Contrast is Key**: For depth maps, more contrast = more dramatic parallax
3. **Clean Edges**: Alpha masks should have clean, feathered edges (not jagged)
4. **Compression**: Always compress final images (TinyPNG, Squoosh)
5. **Iterations**: Generate 5-10 variations and pick the best one

---

## 🆘 Troubleshooting

**"Depth map isn't working"**
- Ensure it's pure grayscale (no color)
- Check that white = foreground, black = background
- Try increasing contrast
- Apply gaussian blur for smoother gradients

**"Alpha mask has harsh edges"**
- Apply 2-3px feather/blur to edges
- Use Select and Mask in Photoshop to refine
- Ensure PNG has proper alpha channel

**"Images are too large"**
- Use TinyPNG or Squoosh to compress
- Target: hero-image < 500KB, others < 200KB
- Quality 85% is usually perfect

---

Ready to create stunning visuals! 🎨
