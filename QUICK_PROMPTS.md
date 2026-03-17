# 🎨 Quick Reference: AI Image Prompts

## Copy-Paste Ready Prompts for Noorish Studio

---

### 1️⃣ HERO IMAGE (Main Visual)

**🎯 Recommended Prompt (Midjourney/DALL-E):**

```
A cinematic photograph of a professional video editor's workspace, shot from a 45-degree elevated angle. Two 27-inch 4K monitors displaying Adobe Premiere Pro timeline with vibrant color grading in reds and cyans. Sleek black desk with carbon fiber texture. Mechanical keyboard with RGB backlighting glowing in red and cyan. Professional audio interface, color grading panel, and premium mouse visible. Dark moody studio lighting with monitors as primary light source creating dramatic rim lighting. Racing-inspired aesthetic with premium materials. Shallow depth of field f/2.8, bokeh background with subtle studio equipment. Ultra-detailed 8K photography, cinematic color grading, professional product photography style. Color palette: deep blacks, vibrant red #FF3B3B, bright cyan #00D9FF, dark blue #0A0E27 --ar 16:9 --style raw --v 6
```

**⚡ Shorter Version:**

```
Professional video editing workspace, dual monitors with Premiere Pro, dark studio lighting, red and cyan RGB keyboard, motorsport aesthetic, cinematic photography, shallow depth of field, 8K --ar 16:9
```

**🎬 Alternative (Action Shot):**

```
Cinematic behind-the-scenes shot of video editor working at night, hands on color grading panel, multiple monitors showing racing footage, dramatic rim lighting in red and cyan, motorsport atmosphere, editorial photography, 8K --ar 16:9
```

**🎨 Alternative (Abstract/Artistic):**

```
Abstract minimalist composition of video editing elements: floating timeline scrubbers, color wheels, waveforms. Gradient from red to cyan. Premium 3D render, glass materials, dark background, motorsport design --ar 16:9
```

---

### 2️⃣ DEPTH MAP

**🔧 DON'T generate from scratch - Use these tools instead:**

1. **Depth Anything V2** (Best): https://huggingface.co/spaces/depth-anything/Depth-Anything-V2
2. **MiDaS**: https://replicate.com/cjwbw/midas
3. **ZoeDepth**: https://huggingface.co/spaces/shariqfarooq/ZoeDepth

→ Upload your hero image → Download the depth map → Done!

**🎨 If you MUST generate directly (not recommended):**

```
Grayscale depth map for video editing workspace, white foreground elements (keyboard, mouse), light gray monitors and desk, medium gray background, black far wall, smooth gradients, gaussian blur, professional depth map for 3D parallax, monochrome --ar 16:9 --style raw --no color
```

---

### 3️⃣ ALPHA MAP

**🔧 DON'T generate from scratch - Use these tools instead:**

1. **Remove.bg** (Easiest): https://www.remove.bg/
2. **Photoshop**: Select → Subject → Create Layer Mask → Export PNG

→ Upload hero image → Download PNG with transparent background → Done!

---

## 🎯 Free AI Tools to Use

| Tool | Best For | Link | Cost |
|------|----------|------|------|
| **Bing Image Creator** | Quick hero images | [bing.com/images/create](https://www.bing.com/images/create) | Free |
| **Leonardo AI** | Stylized photos | [leonardo.ai](https://leonardo.ai/) | Free tier |
| **Stable Diffusion** | Full control | [stablediffusionweb.com](https://stablediffusionweb.com/) | Free |
| **Depth Anything** | Depth maps | [HuggingFace](https://huggingface.co/spaces/depth-anything/Depth-Anything-V2) | Free |
| **Remove.bg** | Alpha masks | [remove.bg](https://www.remove.bg/) | Free |

---

## ⚡ 3-Minute Workflow

1. **Go to Bing Image Creator** → Paste hero image prompt → Generate
2. **Download best result** → Save as `hero-image.jpg`
3. **Go to Depth Anything** → Upload hero-image.jpg → Download depth map
4. **Save depth map** as `hero-depth.jpg`
5. **Go to Remove.bg** → Upload hero-image.jpg → Download PNG
6. **Open PNG in any editor** → If needed, invert (subject should be white)
7. **Save** as `hero-alpha.png`
8. **Place all 3 files** in `/public/assets/images/`
9. **Done!** 🎉

---

## 🎨 Customization Tips

Want a different style? Replace keywords in the prompts:

| Replace This | With This | Effect |
|--------------|-----------|--------|
| "video editing workspace" | "music production studio" | Different industry |
| "red and cyan" | "purple and gold" | Different colors |
| "motorsport aesthetic" | "luxury minimalist" | Different vibe |
| "racing-inspired" | "architect's desk" | Different theme |
| "cinematic photography" | "3D render" | CGI instead of photo |

---

## 🚀 Using Placeholders

**Don't have images yet?**

1. The project includes placeholder SVGs
2. Convert them to JPG/PNG:
   - Go to [cloudconvert.com](https://cloudconvert.com/svg-to-jpg)
   - Upload placeholders → Convert → Download
3. Test the site with placeholders first
4. Replace with real images later

---

## 📋 Checklist

- [ ] Generate hero image (1920x1080)
- [ ] Create depth map from hero image
- [ ] Create alpha mask from hero image
- [ ] Compress all images (< 500KB each)
- [ ] Save in `/public/assets/images/`
- [ ] Test depth effect in browser
- [ ] Adjust if needed

---

**Time estimate:** 5-10 minutes total using free tools! 🚀
