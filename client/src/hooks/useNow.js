import { useEffect, useState } from 'react';

/** A Date that re-renders on an interval — used for the live clock and "next meal" logic. */
export default function useNow(intervalMs = 30000) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return now;
}
