# Casino Frontend Redesign

**Date:** 2026-05-29  
**Project:** SepoCasino — 48h challenge, UX/visual judging

---

## Goal

Redesign the casino frontend to feel like a serious premium casino — not a crypto toy. Priority: judges evaluate UX and visual quality.

---

## Design System

### Colors
| Token | Value | Usage |
|---|---|---|
| `bg-base` | `#05050a` | Page background |
| `bg-surface` | `#0a0812` | Cards, inputs |
| `text-primary` | `#e8e0d0` | Main text (warm cream) |
| `text-muted` | `#444` | Labels, secondary |
| `text-dim` | `#2a2530` | Hints, range labels |
| `gold` | `#d4a830` | Accents, CTA, balance |
| `win` | `#3db870` | WIN results |
| `loss` | `#2a1520` | LOSS results (subdued) |
| `border` | `#1a1520` | Dividers, card borders |
| `border-surface` | `#2a2030` | Input borders |

### Typography
- **Serif (numbers, headings, hero):** Cormorant Garamond — weights 300/400/600, italic variant for hero tagline
- **Sans (labels, UI, buttons):** Helvetica Neue / system-ui — uppercase, letter-spacing 3–5px, weight 700 for CTAs
- **Scale:** result number 140px, hero title ~64px, section labels 8–9px uppercase

---

## Architecture: Two Modes

### Mode 1 — Landing (wallet disconnected)

**Layout:** Fullscreen, centered content, sticky minimal header.

**Components:**
- `ParticleBackground` — Vanta.js `NET` effect, gold color `#d4a830`, dark bg `#05050a`. Initialised once on mount, destroyed on unmount.
- `HeroContent` — centered flex column:
  - Eyebrow: `ON-CHAIN · VERIFIABLE · NON-CUSTODIAL` (9px sans, letter-spacing 6px, gold)
  - Title: `Roll the dice.` + italic `Own the odds.` (Cormorant Garamond, ~64px, cream)
  - Subtitle: `ETHEREUM SEPOLIA TESTNET` (sans, muted)
  - Connect button: gold bg, black text, uppercase, letter-spacing 4px
  - Stats row (border-top): 2% House Edge · 49× Max Payout · 0.001 Min Bet — gold values, muted labels
- Header: logo left (`♠ SEPO CASINO`), network label right

**Transition to Game:** `AnimatePresence` wraps both modes. Landing exits with `opacity: 0, y: -20`. Game enters with `opacity: 0, y: 20` → `opacity: 1, y: 0`. Duration 0.5s ease.

---

### Mode 2 — Game (wallet connected)

**Layout:** Sticky header + centered max-width `900px` main.

**Header (sticky):**
- Left: `♠ SEPO CASINO` logo
- Right: balance value (Cormorant, gold) + `ETH` label + DEPOSIT button (gold) + WITHDRAW button (outline) + wallet address (muted)
- No balance panel on the side — everything in header

**Main content:**

#### Result Area
- Full width, centered, `padding: 48px 0`
- Idle state: dim placeholder `—`
- Rolling state: number cycling animation (Framer Motion, random numbers flashing via `animate` with spring)
- Final state: large number (140px Cormorant light) in cream
- WIN: number pulses gold with `scale: 1.05` spring, status text green `WIN · +X.XXXX ETH`
- LOSS: number stays cream, status text dim red `LOSS`
- Divider line below

#### Controls (2-column grid below result)
Left column — Prediction slider:
- Label `WIN IF ROLL ≤` + current value (36px Cormorant)
- Custom styled range input — gold thumb and fill, dark track
- Range labels: `RISKY · 2` / `98 · SAFE`
- Odds row: 3 boxes (Chance / Multiplier / Payout) — bordered, Multiplier value in gold

Right column — Bet & Roll:
- Label `BET AMOUNT (ETH)`
- Input: dark bg, surface border, Cormorant 18px
- Quick-bet chips: 0.001 / 0.01 / 0.05 / 0.1 — active chip highlighted gold
- ROLL THE DICE button: full width, gold bg, black text, uppercase, letter-spacing 5px
- Framer Motion on button: `whileHover: scale 1.02`, `whileTap: scale 0.97` + brightness flash on roll start

#### History (full width, below divider)
- Section label `RECENT ROLLS`
- Each row: roll number (Cormorant 20px) + meta (bet · threshold) + WIN/LOSS badge + Etherscan link `↗`
- WIN rows: cream number. LOSS rows: dim number
- Animate new rows in with `initial: {opacity:0, y:-8}` → `animate: {opacity:1, y:0}`

---

## Animation Stack

| Library | Version | Usage |
|---|---|---|
| `vanta` | latest | Hero particle background (NET effect) |
| `three` | peer dep for vanta | Required by Vanta |
| `framer-motion` | already in ecosystem / add if missing | All UI animations |

**Framer Motion patterns:**
- `AnimatePresence` — landing ↔ game transition
- `motion.div` with `initial/animate/exit` — result area, history rows
- `useAnimate` hook — rolling number sequence
- `whileHover/whileTap` — Roll button, quick-bet chips

---

## Files to Change

| File | Change |
|---|---|
| `src/index.css` | Replace color tokens, add Google Fonts import (Cormorant Garamond) |
| `src/App.tsx` | Two-mode layout with AnimatePresence, new Header component |
| `src/components/DiceGame.tsx` | Full-width layout, Framer Motion result animation |
| `src/components/BalancePanel.tsx` | Move into header as inline controls |
| `src/components/History.tsx` | Full-width, animated rows |
| `src/components/ParticleBackground.tsx` | New — Vanta NET wrapper |

---

## Out of Scope

- Mobile responsiveness (judges likely on desktop)
- Dark/light theme toggle
- Sound effects
- i18n
