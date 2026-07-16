import { useRef, useState, useEffect } from "react";

export default function usePullToRefresh(onRefresh, threshold = 70) {
  const [pulling, setPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const startY = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Trouver le vrai conteneur scrollable (AppShell #app-content)
    const getScrollEl = () => {
      let node = el.parentElement;
      while (node) {
        const style = window.getComputedStyle(node);
        if ((style.overflowY === "auto" || style.overflowY === "scroll") && node.scrollHeight > node.clientHeight) {
          return node;
        }
        node = node.parentElement;
      }
      return el; // fallback
    };

    const onTouchStart = (e) => {
      const scrollEl = getScrollEl();
      if (scrollEl.scrollTop <= 1) {
        startY.current = e.touches[0].clientY;
      }
    };

    const onTouchMove = (e) => {
      if (startY.current === null) return;
      const dist = e.touches[0].clientY - startY.current;
      if (dist > 0) {
        setPullDistance(Math.min(dist, threshold * 1.5));
        if (dist > 10) e.preventDefault();
      }
    };

    const onTouchEnd = () => {
      if (pullDistance >= threshold) {
        setPulling(true);
        Promise.resolve(onRefresh()).finally(() => {
          setPulling(false);
          setPullDistance(0);
        });
      } else {
        setPullDistance(0);
      }
      startY.current = null;
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [onRefresh, pullDistance, threshold]);

  return { containerRef, pulling, pullDistance };
}