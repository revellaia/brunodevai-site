# Frame Motion Hero Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the cinematic-hotspot hero with a single, premium frame-motion experience driven by pointer, touch drag, and scroll.

**Architecture:** Keep the existing static HTML site and Motion Policy registry. Replace the hotspot DOM/CSS/controller and living-video autoplay controller with one frame-motion controller that scrubs the existing CFR desktop/mobile sources and exposes only a progress rail plus accessible status. Preserve all non-hero copy and navigation.

**Tech Stack:** HTML, CSS, vanilla JavaScript, native `<video>`, Playwright headed QA, ffprobe/Gitleaks.

---

### Task 1: Create the failing frame-motion acceptance test

**Files:**
- Create: `C:/Users/MICRO/AppData/Local/Temp/playwright-frame-motion-red.js`

- [x] **Step 1: Assert the target contract**

The test must fail on the current hotspot page when it asserts: no `.hero-hotspot`, no `.hero-hotspot-panel`, no canvas, `data-capability-mode="frame-motion"` in full/system, video paused with a stable `currentTime`, `.hero-frame-rail` present, and no active timers/RAFs after idle.

- [x] **Step 2: Run it**

Run headed Playwright against `http://127.0.0.1:8798/`. Expected: FAIL because hotspots/panels still exist and the current capability is `cinematic`.

### Task 2: Replace hero interaction markup and styling

**Files:**
- Modify: `index.html` hero styles and hero markup.

- [x] **Step 1: Remove hotspot presentation**

Delete the six hotspot buttons, six panel articles, dot strip, hotspot-specific responsive rules, and the canvas. Keep the figure/video and hero copy/CTA unchanged.

- [x] **Step 2: Add the single motion affordance**

Add a semantic `.hero-frame-motion` region with a non-interactive `.hero-frame-rail` (`role="progressbar"`, `aria-valuemin="0"`, `aria-valuemax="100"`, `aria-valuenow`) and an `aria-live="polite"` `.hero-frame-status`. Keep the rail visually quiet: 1 px track, 2 px neon progress, no box or card.

- [x] **Step 3: Make the video non-playing by default**

Remove `autoplay` and `loop` from the video. Preserve `muted`, `playsinline`, `preload="auto"`, poster, and responsive sources.

### Task 3: Implement the frame-motion controller

**Files:**
- Modify: `index.html` Motion Policy tuning, video controller, debug helper, and language refresh.

- [x] **Step 1: Add failing behavior checks**

The RED test must check that pointer movement changes `currentTime`, pointer leave preserves it, a touch-like horizontal drag changes it, scrolling updates it on coarse pointer, reduced mode pauses at a still frame, and switching modes leaves no active RAF/timer.

- [x] **Step 2: Implement one controller**

Use `loadedmetadata` to capture duration. Map pointer X to `0.04..0.96` of the duration. Map a horizontal touch drag to the same range while leaving vertical pan native. Map the hero's viewport progress on scroll only for coarse pointers. Use one registry-managed RAF only when `targetTime !== currentTime`; stop when within 0.01 s. Never call `video.play()` in frame motion mode.

- [x] **Step 3: Integrate Motion Policy**

`system` and `full` select `frame-motion` unless effective reduced is true; `reduced` selects `still-premium`, pauses video and removes the active RAF. Set `hero.dataset.capabilityMode` and update the rail/status. Preserve generation checks and cleanup.

- [x] **Step 4: Update localized labels**

Change the full-mode label to `Frame motion` in PT/EN and refresh rail/status text on language changes. Keep the three-mode control and existing CTA/menu copy.

### Task 4: Verify and polish in a real browser

**Files:**
- Create: `output/2026-07-brunodevai-frame-motion/` internal reports/evidence.

- [x] **Step 1: Run RED then GREEN acceptance**
- [x] **Step 2: Inspect headed screenshots at desktop and mobile**
- [x] **Step 3: Run Chromium/Firefox/WebKit matrix and keyboard/reduced checks**
- [x] **Step 4: Run a 10-second dropped-frame measurement after warmup**
- [x] **Step 5: Run `git diff --check` and Gitleaks**

### Task 5: Commit and handoff

**Files:**
- Modify: only `index.html` and any new optimized video/report files required by evidence.

- [x] **Step 1: Stage only the scoped files**
- [x] **Step 2: Commit `feat: rebuild hero as frame motion experience`**
- [x] **Step 3: Push the branch, never merge/deploy**
- [x] **Step 4: Update Wiki-Brain SNAP, project page, and log**
