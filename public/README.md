# Public assets

Files here are served at the site root (`/…`).

## `tandir-360.mp4` (expected)

The cinematic intro at the top of the homepage scrubs a **360° rotating
Turkish tandır oven** video. Drop it here as:

- **`tandir-360.mp4`** — the video. Use a short (10–30 s) full 360° rotation.
- **`tandir-poster.jpg`** — a still frame used as `poster` while the video loads
  (also shown under `prefers-reduced-motion`). Optional but recommended.

Until the file exists, the intro falls back to a molten "ember disc" so the
section still looks intentional.

### Recommended encode

For smooth scroll-scrubbing on iOS/Safari, encode with a keyframe on **every**
frame (larger file, but seek is instant):

```
ffmpeg -i tandir-360-source.mp4 -g 1 -c:v libx264 -pix_fmt yuv420p -crf 23 \
       -movflags +faststart -an public/tandir-360.mp4
```

If bandwidth matters more than absolute smoothness, use `-g 12` (keyframe every
12 frames) — Safari will still snap OK.
