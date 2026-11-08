---
name: Companion Note
colors:
  surface: '#f9f9f6'
  surface-dim: '#dadad7'
  surface-bright: '#f9f9f6'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f4f1'
  surface-container: '#eeeeeb'
  surface-container-high: '#e8e8e5'
  surface-container-highest: '#e2e3e0'
  on-surface: '#1a1c1b'
  on-surface-variant: '#424752'
  inverse-surface: '#2f312f'
  inverse-on-surface: '#f1f1ee'
  outline: '#727783'
  outline-variant: '#c2c6d4'
  surface-tint: '#175db2'
  primary: '#004790'
  on-primary: '#ffffff'
  primary-container: '#1a5fb4'
  on-primary-container: '#cbdcff'
  inverse-primary: '#aac7ff'
  secondary: '#904d00'
  on-secondary: '#ffffff'
  secondary-container: '#fe932c'
  on-secondary-container: '#663500'
  tertiary: '#773600'
  on-tertiary: '#ffffff'
  tertiary-container: '#9b4900'
  on-tertiary-container: '#ffd3b9'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d6e3ff'
  primary-fixed-dim: '#aac7ff'
  on-primary-fixed: '#001b3e'
  on-primary-fixed-variant: '#00458d'
  secondary-fixed: '#ffdcc3'
  secondary-fixed-dim: '#ffb77d'
  on-secondary-fixed: '#2f1500'
  on-secondary-fixed-variant: '#6e3900'
  tertiary-fixed: '#ffdbc8'
  tertiary-fixed-dim: '#ffb68a'
  on-tertiary-fixed: '#321300'
  on-tertiary-fixed-variant: '#743500'
  background: '#f9f9f6'
  on-background: '#1a1c1b'
  surface-variant: '#e2e3e0'
typography:
  headline-lg:
    fontFamily: Noto Sans
    fontSize: 1.75rem
    fontWeight: '700'
    lineHeight: 2.8rem
  headline-lg-mobile:
    fontFamily: Noto Sans
    fontSize: 1.5rem
    fontWeight: '700'
    lineHeight: 2.4rem
  headline-md:
    fontFamily: Noto Sans
    fontSize: 1.5rem
    fontWeight: '700'
    lineHeight: 2.4rem
  headline-sm:
    fontFamily: Noto Sans
    fontSize: 1.25rem
    fontWeight: '700'
    lineHeight: 2.1rem
  body-lg:
    fontFamily: Noto Sans
    fontSize: 1.25rem
    fontWeight: '700'
    lineHeight: 2.2rem
  body-md:
    fontFamily: Noto Sans
    fontSize: 1.125rem
    fontWeight: '400'
    lineHeight: 2.0rem
  body-sm:
    fontFamily: Noto Sans
    fontSize: 1rem
    fontWeight: '400'
    lineHeight: 1.75rem
  label-lg:
    fontFamily: Noto Sans
    fontSize: 1.125rem
    fontWeight: '700'
    lineHeight: 1.8rem
  label-md:
    fontFamily: Noto Sans
    fontSize: 1rem
    fontWeight: '700'
    lineHeight: 1.6rem
  label-sm:
    fontFamily: Noto Sans
    fontSize: 0.875rem
    fontWeight: '500'
    lineHeight: 1.4rem
  ruby:
    fontFamily: Noto Sans
    fontSize: 0.6875rem
    fontWeight: '500'
    lineHeight: 1rem
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-tablet: 1.5rem
  gutter-desktop: 2rem
  margin: 1rem
  margin-tablet: 1.5rem
  margin-desktop: 2.5rem
  space-xs: 0.375rem
  space-sm: 0.75rem
  space-md: 1.125rem
  space-lg: 1.5rem
  space-xl: 2.25rem
  space-2xl: 3rem
---

## Brand & Style

### Brand Personality & Core Metaphor
The design system embodies the metaphor of an attentive companion seated quietly beside a patient or multidisciplinary team: unobtrusive, poised, and offering a handwritten note precisely when clarification is needed. The interface never competes with face-to-face eye contact or clinical dialogue. It functions as a calm, accessible digital notepad that translates clinical ambiguity into immediate mutual understanding.

### Target Audience & Emotional Intent
- **Audience:** Patients, elderly individuals, family caregivers, multidisciplinary healthcare professionals (physicians, nurses, pharmacists, medical social workers, therapists).
- **Emotional Intent:** Unconditional reassurance, psychological safety, clarity without sensory fatigue, and institutional trust. Users facing difficult health conversations should feel anchored rather than overwhelmed.

### Design Movement & Aesthetic Form
- **Warm Paper Tactile & High-Legibility Editorial:** Anchored in clean physical stationery aesthetics (notebook paper tones, subtle tactile card containers) combined with crisp, functional modern UI. High luminance contrast and large tactile touch zones ensure seamless operation across handheld tablets, bedside smartphones, and clinic desk terminals.

## Colors

### Color Roles & Semantics

- **Primary (`#1A5FB4` / Deep Clinical Blue):** Designates confirmed status, primary actions, clarity, and authority. Used for completed items, confirmed checkmarks, and primary interactive controls. A deeper variant (`#164E8A`) serves active and focused states.
- **Secondary / Accent (`#D97706` / Calibrated Warm Amber):** Highlights unaddressed medical vocabulary, newly surfaced unfamiliar words, and items requiring explicit attention. It commands focus gently without triggering emergency alarm fatigue.
- **Canvas & Paper (`#FBFBF8` Base Off-White, `#FFFFFF` Surface, `#EEF2F8` Card Container):** Emulates tactile textured stationery. Keeps glare to a minimum in brightly lit examination rooms or dim bedside settings.
- **Companion Memo Slate (`#1E232A` Dark Slate):** Used for bottom floating mini-player bars and rapid-interjection notification cards. Reverses luminance to signal an immediate, transient note handed across the table, contrasted with crisp `#FFFFFF` typography.
- **Functional Grays & Semantic Borders:**
  - Border Quiet: `#D7DFEA` (structure without stark division)
  - Text Muted: `#525D6B` (subordinate context)
  - Text Primary: `#1E232A` (deep ink black for peak readability)

## Typography

### Typography Strategy
All typography uses **Noto Sans JP** (backed by system UI sans-serif fonts) to ensure cross-platform consistency across clinical iPads, Android tablets, and desktop workstations.

- **Baseline Reading Size:** Body text starts strictly at `1.125rem` (18px) to eliminate squinting and cognitive load during stressful medical consultations.
- **Key Terms & Vocabulary:** Emphasized terms scale to `1.25rem` (20px) Bold (`body-lg`) to serve quick glanceability when resting on a table between two individuals.
- **Ruby (Furigana) Line Height Compensation:** Standard line-height is locked between `1.75` and `1.85` (minimum 1.6 required), preserving ample vertical breathing room for `<ruby>` and `<rt>` elements above kanji without clipping accents or creating erratic line overlaps.

## Layout & Spacing

### Layout Architecture
- **Form-Factor Fluidity:**
  - **Mobile / Bedside Handheld (< 640px):** Single-column stack. Content margins at `1rem`. Fixed bottom clearance buffer of `5.5rem` to prevent overlap with the persistent floating companion bar.
  - **Tablet Shared Surface (640px – 1024px):** Dual-pane view optimized for placement flat on a table between patient and clinician. 8-column layout. Margin `1.5rem`, Gutter `1.5rem`.
  - **Desktop / Consultation Station (> 1024px):** 12-column layout max-width bounded at `1120px` to maintain comfortable eye-tracking distance without excessive neck turning.
- **Touch Target Integrity:** Every clickable element, card tap area, and status toggle enforces a minimum interactive bounding box of `48px × 48px` (exceeding the 44px baseline) with an internal touch clearance minimum of `space-sm` (`0.75rem`).

## Elevation & Depth

### Surface Hierarchy & Tactile Layering
Visual depth is established through tonal paper contrast paired with ultra-soft ambient shadowing, preventing stark clinical coldness while maintaining distinct interface priorities.

- **Level 0 (Canvas Base):** `#FBFBF8`. The tactile paper background onto which all consultation notes are staged.
- **Level 1 (Card & Paper Surfaces):** `#FFFFFF` or `#EEF2F8`. Bordered with a hairline rule (`1px solid #D7DFEA`) and an ambient tinted shadow (`0 2px 8px rgba(22, 78, 138, 0.04)`).
- **Level 2 (Active Focus & Drag States):** Elevated note cards lift slightly with `0 6px 16px rgba(22, 78, 138, 0.08)`.
- **Level 3 (Companion Memo Bar - Persistent Floating Dock):** `#1E232A`. Sits in foreground space over the bottom safe area. Elevated with a focused dark-tinted ambient rise (`0 -4px 20px rgba(0, 0, 0, 0.16)`), visually decoupling it from the scrollable consultation paper beneath.

## Shapes

### Shape Language
The system adopts soft geometry (`roundedness: 2`, `0.5rem` base, scaling to `1rem` on cards and interactive sheet panels).
- **Input Fields & Small Chips:** `0.5rem` (`8px`) border radius prevents harsh corners while maintaining structural discipline.
- **Note Cards & Question Containers:** `1rem` (`16px`) border radius provides a gentle, non-threatening card feel reminiscent of rounded index cards.
- **Confirmation & Floating Action Pills:** Fully pill-shaped (`9999px`) for quick binary choices and floating indicators, signaling effortless touch affordance.

## Components

### 1. Buttons & Binary Clarification Actions
- **Differentiated Yes/No Paradigm:** To safeguard against accidental patient or clinician mis-taps under cognitive strain, "No" and "Yes" use deliberate contrast in both shape and fill:
  - **"No" (いいえ):** Solid filled primary container (`bg: #1A5FB4`, `text: #FFFFFF`, `border-radius: 9999px`). Sturdy, bold, and high-visibility.
  - **"Yes" (はい):** High-contrast structural outline (`bg: transparent`, `border: 2px solid #1A5FB4`, `text: #1A5FB4`, `border-radius: 0.5rem`).
  - Shape difference (pill vs. soft square) paired with fill difference (solid vs. outline) guarantees dual-channel accessibility for color-deficient users.
- **Sizing:** Minimum height `52px`, touch width `min-width: 120px`, label centered at `1.125rem` Bold.

### 2. Inquiry & Question List Items
- **Unconfirmed Status (まだ聞いていない・未確認):**
  - Left indicator: `16px` open circle with an active warm amber fill (`#D97706`).
  - Typography: `body-lg` (`1.25rem` Bold) in primary ink `#1E232A`.
  - Card Surface: Crisp `#FFFFFF` with amber left accent border (`3px solid #D97706`).
- **Confirmed Status (確認済み):**
  - Left indicator: `20px` solid circle (`#1A5FB4`) containing an interior white checkmark icon.
  - Typography: Text color transitions to muted `#525D6B` with a subtle strike-through line (`text-decoration: line-through`).
  - Card Surface: Subdued `#EEF2F8` with muted border.

### 3. Key Term Chips (Furigana-Ready Vocabulary Badges)
- **Visuals:** Background `#FEF3C7` (amber tint), border `1px solid #D97706`, text `#B45309`.
- **Anatomy:** Accommodates `<ruby>` tags with `<rt>` font size locked at `0.6875rem` directly centered above the kanji root.
- **Interactive State:** Tapping the badge triggers an instant companion note definition without interrupting session speech capture.

### 4. Interactive Note Cards
- **Structure:** Encapsulated within a `1rem` rounded surface (`#FFFFFF`), padded with `space-md` (`1.125rem`).
- **Targeting:** Complete card element is interactive with minimum hit area `48px` on all actionable icons.
- **Hover/Tap Feedback:** Background micro-shift to `#F4F7FB` with smooth transition (`150ms ease`).

### 5. Floating Companion Memo Strip (Mini-Player Notification Bar)
- **Role:** The digital embodiment of the companion discreetly handing over a note ("Do you understand this term?").
- **Placement:** Docked `0.75rem` above the bottom screen safe area, centered with `max-width: 640px` and width `calc(100% - 1.5rem)`.
- **Aesthetic:** Dark slate background (`#1E232A`), high-contrast white primary label (`#FFFFFF`), subtle amber keyword tag (`#F59E0B`).
- **Controls:** Embedded quick-tap micro-actions ("分かります" outline button, "詳しく" solid white pill button) allowing instant non-verbal signaling across the table.