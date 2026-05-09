---
name: Slick
colors:
  surface: '#181309'
  surface-dim: '#181309'
  surface-bright: '#3f382d'
  surface-container-lowest: '#120e05'
  surface-container-low: '#201b11'
  surface-container: '#241f14'
  surface-container-high: '#2f291e'
  surface-container-highest: '#3a3428'
  on-surface: '#ede1d0'
  on-surface-variant: '#d4c5ab'
  inverse-surface: '#ede1d0'
  inverse-on-surface: '#363024'
  outline: '#9c8f78'
  outline-variant: '#504532'
  surface-tint: '#fbbc00'
  primary: '#ffe2ab'
  on-primary: '#402d00'
  primary-container: '#ffbf00'
  on-primary-container: '#6d5000'
  inverse-primary: '#795900'
  secondary: '#e5c27b'
  on-secondary: '#402d00'
  secondary-container: '#5d4509'
  on-secondary-container: '#d6b46f'
  tertiary: '#b4efff'
  on-tertiary: '#003640'
  tertiary-container: '#04dcff'
  on-tertiary-container: '#005d6d'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdfa0'
  primary-fixed-dim: '#fbbc00'
  on-primary-fixed: '#261a00'
  on-primary-fixed-variant: '#5c4300'
  secondary-fixed: '#ffdfa0'
  secondary-fixed-dim: '#e5c27b'
  on-secondary-fixed: '#261a00'
  on-secondary-fixed-variant: '#5b4307'
  tertiary-fixed: '#aaedff'
  tertiary-fixed-dim: '#00d9fc'
  on-tertiary-fixed: '#001f26'
  on-tertiary-fixed-variant: '#004e5c'
  background: '#181309'
  on-background: '#ede1d0'
  surface-variant: '#3a3428'
typography:
  display-lg:
    fontFamily: Hanken Grotesk
    fontSize: 40px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.5'
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.2'
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.2'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  xs: 4px
  sm: 12px
  md: 20px
  lg: 32px
  xl: 48px
  container-padding: 20px
  gutter: 16px
---

## Brand & Style

The design system for this application is built on a foundation of "OLED-first" minimalism, optimized for high-energy campus environments. The brand personality is efficient, premium, and sophisticated, aiming to transform a routine canteen task into a high-end digital experience. 

The visual style heavily leans into **Glassmorphism** and **Apple-inspired minimalism**. By using a pure black background, we achieve infinite contrast, allowing the glowing amber accents and translucent frosted glass surfaces to feel tactile and deep. The emotional response should be one of "calm focus"—reducing the cognitive load of a busy student through spacious layouts and clear visual hierarchies.

## Colors

The palette is strictly curated to emphasize the **Amber (#FFBF00)** primary accent, which represents warmth, appetite, and urgency. 

- **Primary:** Amber serves as the call-to-action color and the indicator for active states. It should feel like it "glows" against the dark backdrop.
- **Background:** Pure Black (#000000) is used for the base layer to save battery on OLED screens and provide maximum contrast.
- **Surfaces:** We use "Glass" surfaces—semi-transparent white layers with high background blur—to create depth without introducing heavy grays.
- **Neutrals:** Text utilizes pure white for headings and a muted San Francisco-style gray for secondary information to maintain a clean hierarchy.

## Typography

This design system utilizes **Hanken Grotesk** for its clean, geometric, and modern "San Francisco" feel. It provides the necessary clarity for quick scanning in a canteen setting.

- **Scale:** High contrast between display sizes and body text is essential.
- **Weights:** Use Bold/Semi-Bold for headers to ensure they "pop" against the glass surfaces. Use Regular for body text to maintain legibility.
- **Labels:** **Inter** is used for smaller UI labels and buttons to ensure maximum legibility at tiny scales due to its neutral and tall x-height.

## Layout & Spacing

The layout philosophy follows a **Fluid Grid** with generous, breathable margins to mirror Apple’s high-end aesthetic.

- **Rhythm:** An 8px base grid governs all measurements.
- **Safe Zones:** A standard 20px horizontal margin is maintained on mobile devices to prevent content from hitting the screen edges.
- **Stacking:** Elements are grouped in vertical stacks with 12px spacing within cards and 32px spacing between major sections to emphasize the minimal, "airy" feel.
- **Reflow:** On larger devices, the single-column feed transitions into a multi-column masonry grid for food items, keeping the maximum container width at 1200px.

## Elevation & Depth

Depth is not communicated through shadows, but through **translucency and blur**. 

1.  **Base Layer:** Pure #000000 background.
2.  **Middle Layer (Cards):** 8-10% white opacity with a 20px to 30px Backdrop Blur. A subtle 1px border (12% white) defines the edge.
3.  **Top Layer (Floating Actions):** Higher opacity (15% white) or solid Amber for primary buttons to bring them closest to the user.

This approach creates a "physical" sense of stacked glass sheets, consistent with modern OS design patterns.

## Shapes

The design system uses a **Rounded** shape language to feel approachable and organic. 

- **Standard Elements:** Buttons and input fields use a 0.5rem (8px) radius.
- **Containers:** Large glass cards and product modules use a 1.5rem (24px) radius to create a soft, friendly "squircle" look common in premium hardware.
- **Selection States:** Use pill-shaped (fully rounded) indicators for category chips and status badges.

## Components

### Buttons
- **Primary:** Solid Amber (#FFBF00) with black text. High-gloss finish optional.
- **Secondary:** Glass background with 1px amber border and amber text.
- **Tertiary:** Purely text-based or ghost buttons with subtle white hover states.

### Cards
All cards must use the `backdrop-filter: blur()` property. Borders should be 1px wide, using a "Top-down" light source logic (slightly brighter top border, dimmer bottom).

### Input Fields
Inputs are glass-morphic rectangles. The focus state is indicated by the 1px border changing from 12% white to the Primary Amber, accompanied by a subtle amber outer glow.

### Chips & Tags
Used for dietary restrictions (e.g., "Vegan", "Halal"). These are small, pill-shaped elements with a 10% Amber fill and 100% Amber text.

### Progress & Status
Ordering status (e.g., "In the Kitchen") should be represented by a glowing amber pulse or a sleek, thin horizontal loading bar at the top of the glass card.

### Lists
List items are separated by thin, 4% white dividers that do not reach the full width of the container, maintaining the "floating" aesthetic.