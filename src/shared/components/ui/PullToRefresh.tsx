import React, { useRef, useState } from 'react';

const THRESHOLD = 70;  // px pulled before release triggers refresh

/**
 * Wraps any scrollable container with a native-feeling pull-to-refresh gesture.
 * - Pass className / style that would normally go on the scroll div.
 * - onRefresh must return a Promise; the spinner stays until it resolves.
 */
export const PullToRefresh: React.FC<{
  onRefresh: () => Promise<void>;
  className?: string;
  children: React.ReactNode;
}> = ({ onRefresh, className = '', children }) => {
  const scrollEl  = useRef<HTMLDivElement>(null);
  const startY    = useRef(0);
  const [dragging, setDragging] = useState(false);
  const [pull, setPull]         = useState(0);   // 0 → ~1.8 (proportion of threshold)
  const [busy, setBusy]         = useState(false);

  const atTop = () => (scrollEl.current?.scrollTop ?? 0) <= 2;

  /* ── touch handlers ─────────────────────────────────────── */
  const onTouchStart = (e: React.TouchEvent) => {
    if (busy || !atTop()) return;
    startY.current = e.touches[0].clientY;
    setDragging(true);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!dragging || busy) return;
    if (!atTop()) { setDragging(false); setPull(0); return; }
    const dy = e.touches[0].clientY - startY.current;
    setPull(dy <= 0 ? 0 : Math.min(1.8, dy / THRESHOLD));
  };

  const onTouchEnd = async () => {
    if (!dragging) return;
    setDragging(false);
    if (pull >= 1) {
      setBusy(true);
      setPull(1);
      try { await onRefresh(); } finally { setBusy(false); setPull(0); }
    } else {
      setPull(0);
    }
  };

  /* ── derived visual values ──────────────────────────────── */
  // indicator starts at -44 px (hidden) and slides down as the user pulls
  const indicatorY  = busy ? 12 : pull * THRESHOLD * 0.6 - 44;
  const ballScale   = 0.5 + Math.min(1, pull) * 0.5;
  const arrowRotate = Math.min(1, pull) * 180; // arrow flips when past threshold

  return (
    <div style={{ position: 'relative', flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* ── floating indicator bubble ─────────────────────── */}
      <div
        aria-hidden
        style={{
          position: 'absolute', top: 0, left: 0, right: 0, zIndex: 60,
          display: 'flex', justifyContent: 'center',
          transform: `translateY(${indicatorY}px)`,
          transition: dragging ? 'none' : 'transform 380ms cubic-bezier(.2,.8,.2,1)',
          pointerEvents: 'none',
        }}
      >
        <div style={{
          width: 38, height: 38, borderRadius: '50%',
          background: 'var(--surface)',
          border: '1.5px solid var(--border)',
          boxShadow: '0 4px 18px rgba(0,0,0,0.3)',
          display: 'grid', placeItems: 'center',
          transform: `scale(${ballScale})`,
          transition: dragging ? 'none' : 'transform 250ms ease',
        }}>
          {busy ? (
            /* spinning arc while refreshing */
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round"
              style={{ transformOrigin: 'center', animation: 'spin 0.75s linear infinite' }}>
              <circle cx="12" cy="12" r="9" strokeDasharray="32 56" />
            </svg>
          ) : (
            /* down-arrow that rotates 180° when pulled past threshold */
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="var(--primary)" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round"
              style={{
                transform: `rotate(${arrowRotate}deg)`,
                transition: dragging ? 'none' : 'transform 200ms',
              }}>
              <path d="M12 5v14M6 13l6 6 6-6" />
            </svg>
          )}
        </div>
      </div>

      {/* ── scrollable host ───────────────────────────────── */}
      <div
        ref={scrollEl}
        className={className}
        style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onTouchCancel={onTouchEnd}
      >
        {children}
      </div>
    </div>
  );
};
