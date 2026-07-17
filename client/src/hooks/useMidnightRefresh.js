import { useEffect, useRef } from 'react';

/**
 * Calls `onMidnight` shortly after the next local midnight, then keeps
 * re-scheduling. Used so the dashboard/daily planner automatically rolls over to
 * the next day at 12:00 AM without a manual refresh.
 */
export default function useMidnightRefresh(onMidnight) {
  const cbRef = useRef(onMidnight);
  cbRef.current = onMidnight;

  useEffect(() => {
    let timeoutId;
    const schedule = () => {
      const now = new Date();
      const next = new Date(now);
      next.setHours(24, 0, 5, 0); // 5s after midnight to be safe
      const ms = next.getTime() - now.getTime();
      timeoutId = setTimeout(() => {
        cbRef.current?.();
        schedule();
      }, ms);
    };
    schedule();
    return () => clearTimeout(timeoutId);
  }, []);
}
