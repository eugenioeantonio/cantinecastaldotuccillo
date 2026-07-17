# Photoreal hero frames (drop-in)

The hero automatically upgrades from the real-time 3D crystal to a **photoreal
pre-rendered frame sequence** the moment these files exist. No code changes.

## What to provide

Render a wine glass filling with wine (a slow ~4s "hero" shot, camera locked),
export as a numbered **WebP** sequence:

```
public/frames/desktop/glass_0000.webp … glass_0119.webp   (120 frames, ~1600×2000, transparent or dark bg)
public/frames/mobile/glass_0000.webp  … glass_0089.webp   (90 frames,  ~800×1000)
```

- Naming: `glass_` + 4-digit zero-padded index, starting at `0000`.
- Frame `0000` = empty/first pose, last frame = full glass + poised.
- Keep each WebP well compressed (target < 120 KB desktop, < 60 KB mobile).
- Counts are configurable in `components/hero/hero-frames.tsx` (`FRAME_SEQ`).

## How it works

`hero.tsx` probes `glass_0000.webp` on load. If found → scroll-scrubbed canvas
sequence (advertising-grade). If not → the R3F crystal fallback renders instead,
so the site always works.

Recommended render pipeline: Blender (Cycles) or Cinema 4D + Redshift, HDRI in
`/public/assets/hdri`, glass + wine shaders, motion-blur off, 120 samples.
