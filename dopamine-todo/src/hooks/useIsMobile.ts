import { useEffect, useState } from 'react';

const QUERY = '(max-width: 680px)';

/** Phone-width breakpoint used to switch Command Centre between its desktop glass layout and
    the iPhone-style mobile layout. 680px clears the desktop layout's own sm: breakpoint (640px)
    with room to spare, so the two never fight for the same viewport widths. */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(QUERY).matches : false,
  );

  useEffect(() => {
    const mql = window.matchMedia(QUERY);
    const onChange = () => setIsMobile(mql.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return isMobile;
}
