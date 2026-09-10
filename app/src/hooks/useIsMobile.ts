/**
 * useIsMobile — Lightweight one-shot viewport check.
 *
 * Uses `window.matchMedia` to detect ≤ 768px at mount time.
 * No resize listener is attached — this is intentional to avoid
 * re-render overhead on mobile. The atmosphere components are
 * decorative and don't need to react to live resizing.
 */
import { useState } from 'react';

const MOBILE_BREAKPOINT = '(max-width: 768px)';

export function useIsMobile(): boolean {
  const [isMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(MOBILE_BREAKPOINT).matches;
  });
  return isMobile;
}
