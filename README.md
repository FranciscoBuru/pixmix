# PixMix.fun

Gradient-aware image block reordering with a fast live preview. Upload two square images (ideally 512×512), tune block size and gradient/color weighting, and watch blocks animate into alignment. Export as a GIF with a custom duration.

Repo: https://github.com/FranciscoBuru/pixmix

**Descripción (ES):** Reordena bloques de dos imágenes cuadradas (ideal 512×512) usando gradientes y color para que una se parezca a la otra. Ajusta el tamaño de bloque y el peso de gradiente/color, mira la animación en vivo y expórtala como GIF.

## Tech stack
- Next.js (App Router, SSR shell) + React
- Tailwind CSS (v4) + custom theme
- KaTeX for math rendering in the “How it works” modal

## Development
```bash
npm install
npm run dev
```
Visit http://localhost:3000.

## Usage tips
- Use square images; 512×512 recommended for speed and quality.
- Larger block sizes preview faster; smaller blocks give finer detail.
- Gradient Weight biases edges (higher) vs. color (lower).
- Greedy matching is used for speed on large grids.
- Export GIF length is adjustable up to 5s.

## How it works (math)
- Images are resized to a shared grid of blocks.
- Each block’s signature: Sobel gradients (magnitude, direction) + average RGB.
- Cost per source/target: `w (|Δm| + κ Δθ) + (1-w) ||Δc||₂`, with angle wrap on `[-π, π]` and κ=10.
- Greedy matching assigns blocks; animation is eased and frame-throttled for large block counts.
