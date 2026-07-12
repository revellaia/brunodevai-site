# Frame Motion Hero Design

**Status:** approved for inline execution from the user's explicit “faça!” direction.

## Intent

Turn the hero into one cinematic object: the visitor explores Bruno's working scene by moving the pointer, dragging on touch, or scrolling. The visual should feel authored and expensive because the image itself carries the interaction. No hotspot, card, dialog, carousel, autorotation, or decorative UI cluster remains in the hero.

## Experience

- `system` / “Automática”: frame motion when the device permits motion; follows OS reduced-motion preference.
- `full` / “Frame motion”: frame motion even when the OS preference requests reduced motion.
- `reduced` / “Reduzida”: poster at a calm still frame, no video playback and no continuous motion.
- Fine pointer: horizontal cursor position scrubs the video timeline; pointer leave preserves the chosen frame.
- Touch/coarse pointer: horizontal drag scrubs without hijacking vertical page scrolling; scroll position also advances the frame subtly through the hero.
- A thin neon/gold progress rail and one quiet instruction communicate discoverability without becoming another component layer.

## Architecture

`index.html` remains the single source of truth. The existing CFR desktop/mobile MP4 pair and poster are preserved. The hotspot markup/CSS/controller is removed. The current Motion Policy registry remains authoritative; the frame-motion controller registers its short-lived RAF work and cleans it on mode changes, visibility changes, and reduced mode. The video never calls `play()` in frame-motion mode.

## Quality bar

The hero must read in ten seconds as a premium digital-art direction, retain the existing copy/CTA/navigation, avoid face obstruction and horizontal overflow, keep keyboard and screen-reader status meaningful, and show no console/request failures. The measured frame cadence must remain stable while idle; RAF is permitted only while scrubbing toward a requested frame.

## Verification

Validate at 1366, 1440, 1920, 390, 430 and 768 px; Chromium plus Firefox/WebKit desktop and WebKit touch. Verify pointer scrub, touch drag, scroll progress, mode changes, reduced poster, keyboard focus, language switch, no autoplay, no hotspots/cards, no overflow, and a ten-second dropped-frame window.
