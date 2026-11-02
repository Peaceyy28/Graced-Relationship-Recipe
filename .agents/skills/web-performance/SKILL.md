---
name: web-performance
description: Official Web Performance and Core Web Vitals optimization guidelines from Google web.dev and Vercel. Use when diagnosing or optimizing page load times, Core Web Vitals (LCP, INP, CLS), JavaScript bundle size, image/media delivery, rendering bottlenecks, or network performance.
source: https://web.dev/articles/vitals and https://vercel.com/docs/speed-insights
license: CC-BY 4.0 / Apache-2.0
---

# Web Performance & Core Web Vitals

Comprehensive web performance optimization guidelines based on Google's official [web.dev](https://web.dev) specifications and modern front-end performance engineering best practices.

---

## 1. Core Web Vitals Targets (75th Percentile)

Always target the "Good" threshold across real-user monitoring (RUM) and lab diagnostics:

| Metric | Target (Good) | Needs Improvement | Poor | Description |
| :--- | :--- | :--- | :--- | :--- |
| **LCP** (Largest Contentful Paint) | **≤ 2.5 s** | 2.5 s – 4.0 s | > 4.0 s | Main visual content load time |
| **INP** (Interaction to Next Paint) | **≤ 200 ms** | 200 ms – 500 ms | > 500 ms | Responsiveness to user interactions |
| **CLS** (Cumulative Layout Shift) | **≤ 0.1** | 0.1 – 0.25 | > 0.25 | Visual stability during page life |
| **FCP** (First Contentful Paint) | **≤ 1.8 s** | 1.8 s – 3.0 s | > 3.0 s | First DOM element render |
| **TTFB** (Time to First Byte) | **≤ 800 ms** | 800 ms – 1.8 s | > 1.8 s | Server response latency |

---

## 2. Loading Performance & Network Optimization

### Resource Hints & Critical Discovery
- **Early Connections:** Add `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>` for critical third-party CDNs.
- **Resource Prioritization:**
  - Mark the single hero/LCP image with `fetchpriority="high"`.
  - Mark non-critical assets with `loading="lazy"` and `fetchpriority="low"`.
- **Preload Critical Assets:** Preload critical font files (`<link rel="preload" as="font" type="font/woff2" crossorigin>`) to eliminate FOIT/FOUT.

### Network Waterfall & Caching
- **HTTP/2 & HTTP/3:** Ensure assets are served over multiplexed connections.
- **Cache-Control:** Use immutable long-term caching for hashed static bundles:
  `Cache-Control: public, max-age=31536000, immutable`
- **Dynamic Content:** Use `stale-while-revalidate` caching on edge CDNs for semi-dynamic data.

---

## 3. Image & Media Optimization

1. **Modern Formats:** Always serve **AVIF** (preferred) or **WebP** over PNG/JPEG (often 30–50% smaller at identical quality).
2. **Explicit Dimensions:** Always specify `width` and `height` (or CSS `aspect-ratio`) on `<img>` and `<video>` tags to reserve layout space and eliminate **CLS**.
3. **Responsive Images:** Use `srcset` and `sizes` attributes so mobile devices do not download desktop-resolution assets:
   ```html
   <img src="hero-800.webp"
        srcset="hero-400.webp 400w, hero-800.webp 800w, hero-1200.webp 1200w"
        sizes="(max-width: 600px) 100vw, 800px"
        width="800" height="450"
        fetchpriority="high"
        alt="Product showcase">
   ```
4. **SVG Optimization:** Remove unnecessary metadata, editor comments, and invisible anchor points with SVGO.

---

## 4. JavaScript Bundle Optimization

1. **Route-Based & Component-Based Code Splitting:**
   - Avoid monolithic client bundles. Dynamically import heavy modals, rich-text editors, or chart libraries only when needed:
     ```tsx
     const HeavyChart = React.lazy(() => import('./HeavyChart'));
     ```
2. **Eliminate Barrel File Bottlenecks:**
   - Avoid importing from root index files (`import { Button } from '@/components'`). Instead import directly from modular paths (`import { Button } from '@/components/Button'`) to maximize tree-shaking efficacy.
3. **Audit Third-Party Scripts:**
   - Load analytics, support widgets, and tag managers with `defer` or `async`, or initialize via `requestIdleCallback()` after initial page interactive state.
   - Self-host web fonts to reduce DNS lookups and external dependencies.

---

## 5. Rendering & Runtime Performance (INP Optimization)

1. **Break Up Long Tasks (> 50 ms):**
   - Yield to the main thread during heavy calculations using `scheduler.yield()` or `setTimeout(..., 0)`.
2. **CSS Layout Containment:**
   - Use `content-visibility: auto` and `contain-intrinsic-size` on long scrollable lists or below-the-fold sections to skip rendering work until scrolled into viewport.
3. **Avoid Forced Synchronous Layout / Layout Thrashing:**
   - Never alternate reading geometry (`element.offsetHeight`, `getBoundingClientRect()`) and writing styles (`element.style.width = ...`) in a loop.
4. **CSS Animations:**
   - Animate exclusively with `transform` and `opacity` properties handled by the compositor thread. Never animate `width`, `height`, `top`, `margin`, or `left`.

---

## 6. Performance Profiling & Measurement

- **Chrome DevTools Performance Panel:** Record traces with 4x/6x CPU throttling and Fast 3G network emulation.
- **Web Vitals RUM Snippet:** Monitor real-world user metrics:
  ```javascript
  import { onLCP, onINP, onCLS } from 'web-vitals';
  onLCP(console.log);
  onINP(console.log);
  onCLS(console.log);
  ```
- **Lighthouse CI:** Automate performance regression checks within CI/CD pipelines with thresholds set to ≥ 90 performance score.
