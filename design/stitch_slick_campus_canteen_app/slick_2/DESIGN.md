---
name: Slick
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#3a3939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#d8c3ad'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#a08e7a'
  outline-variant: '#534434'
  surface-tint: '#ffb95f'
  primary: '#ffc174'
  on-primary: '#472a00'
  primary-container: '#f59e0b'
  on-primary-container: '#613b00'
  inverse-primary: '#855300'
  secondary: '#d0bcff'
  on-secondary: '#3c0091'
  secondary-container: '#571bc1'
  on-secondary-container: '#c4abff'
  tertiary: '#51e77b'
  on-tertiary: '#003915'
  tertiary-container: '#2bca62'
  on-tertiary-container: '#004f20'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffddb8'
  primary-fixed-dim: '#ffb95f'
  on-primary-fixed: '#2a1700'
  on-primary-fixed-variant: '#653e00'
  secondary-fixed: '#e9ddff'
  secondary-fixed-dim: '#d0bcff'
  on-secondary-fixed: '#23005c'
  on-secondary-fixed-variant: '#5516be'
  tertiary-fixed: '#6bff8f'
  tertiary-fixed-dim: '#4ae176'
  on-tertiary-fixed: '#002109'
  on-tertiary-fixed-variant: '#005321'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
typography:
  display-lg:
    fontFamily: epilogue
    fontSize: 72px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: epilogue
    fontSize: 40px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: epilogue
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  body-md:
    fontFamily: inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-sm:
    fontFamily: inter
    fontSize: 14px
    fontWeight: '300'
    lineHeight: '1.5'
  mono-label:
    fontFamily: jetbrainsMono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: 0.1em
  mono-data:
    fontFamily: jetbrainsMono
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.4'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 24px
  margin: 32px
  container-max: 1280px
---

## Brand & Style

This design system embodies a "Premium Hacker" aesthetic, blending the precision of high-end developer tools with the luxury of editorial design. It targets a sophisticated technical audience that values speed, clarity, and "dark mode" native experiences. 

The visual language is rooted in **Glassmorphism** and **Technical Minimalist** movements. It utilizes deep black surfaces, subtle translucency, and intentional "light leaks" from border glows to create depth. The atmosphere is quiet and focused, punctuated by sharp, high-contrast accents that evoke the feeling of a high-end flight boarding pass or a custom terminal emulator. Grain textures are applied as a global overlay to break digital flatness and provide a tactile, analog quality to the interface.

## Colors

The palette is anchored by a pure black background to ensure maximum contrast and depth. 

- **Primary (Warm Amber/Gold):** Used exclusively for primary calls to action, active states, and critical highlights. It represents "the path forward."
- **Secondary (Vivid Violet):** Derived from the brand profile, used for auxiliary interactive elements and category labeling.
- **Success (Neon Green):** Reserved for confirmation states, "live" indicators, and successful build deployments.
- **Error/Sold Out (Red):** A sharp, high-visibility red for destructive actions or unavailable items.
- **Neutral:** A range of deep grays and transparent whites are used for borders and secondary text to maintain the glassmorphism effect without breaking the pure black canvas.

## Typography

The typographic hierarchy relies on the tension between **Epilogue** for bold, editorial headlines and **Inter** for functional body copy. **JetBrains Mono** is introduced for "boarding pass" elements, metadata, and technical readouts.

Headlines should be set with tight tracking to feel dense and impactful. Subtext and secondary body copy should utilize lighter weights and slightly reduced opacity (70-80%) to create a tiered information hierarchy. Monospaced elements should always be used for timestamps, IDs, and status labels to reinforce the developer-centric aesthetic.

## Layout & Spacing

This design system uses a **Fixed Grid** approach for desktop environments, centering content within a 1280px max-width container. The grid is a 12-column system with generous 24px gutters to allow the glassmorphic surfaces room to breathe.

Layouts are inspired by "Terminal Dashboards." Content is often organized into modular bento-box style tiles. On mobile, the grid collapses to a single column with 16px side margins. Spacing is strictly mathematical, built on a 4px base unit to ensure alignment of monospaced text and bordered containers.

## Elevation & Depth

Depth is not communicated via traditional drop shadows, but through **Glassmorphism** and **Illumination**:

1.  **Surfaces:** Backgrounds use `#0a0a0a`. Elevated surfaces (cards, modals) use a semi-transparent fill (`rgba(255, 255, 255, 0.03)`) with a `20px` backdrop blur.
2.  **Borders:** Every elevated element must have a 1px border. Use a linear gradient for borders: `rgba(255,255,255,0.1)` to `rgba(255,255,255,0.02)` to simulate light hitting an edge.
3.  **Glows:** Primary elements (like active CTAs) feature a subtle outer glow using the accent color with high diffusion (30-40px) and low opacity (0.15).
4.  **Texture:** A fixed grain overlay (SVG or PNG) is applied to the entire viewport at 3% opacity to give the "glass" a physical substrate.

## Shapes

The shape language is disciplined and "Soft-Tech." Standard components use a `0.25rem` (4px) radius to maintain a precise, engineered look. Larger containers and cards use `0.5rem` (8px). 

Interactive elements like tags or "status pills" may use a full pill-shape, but only when containing monospaced text. This juxtaposition of sharp 90-degree outer layouts and slightly softened inner components creates a sophisticated, modern tool feel.

## Components

- **Primary Button:** Solid `#f59e0b` fill with black text. On hover, apply a subtle white inner-glow (top edge).
- **Glass Card:** Background `rgba(255,255,255,0.03)`, 1px semi-transparent border, 20px backdrop blur. Used for grouping related data.
- **Terminal Input:** Pure black background with a 1px white border at 10% opacity. Focus state changes border to `#f59e0b` with a matching 4px outer glow.
- **Boarding Pass Labels:** Use `mono-label` typography. Labels should be accompanied by a small geometric icon (square or diamond) to signify data points.
- **Status Indicators:** Small 6px glowing circles. Use Success Neon Green for active/online and Red for inactive/error.
- **Grain Overlay:** A global `div` with a noise texture and `pointer-events: none` to unify all components under a single tactile layer.