import { useCallback, useEffect, useRef } from 'react';

// Returns a debounced version of `fn`. The latest args win. Cleans up on unmount.
export default function useDebouncedCallback(fn, delay = 600) {
  const timer = useRef(null);
  const fnRef = useRef(fn);
  fnRef.current = fn;

  const debounced = useCallback(
    (...args) => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => fnRef.current(...args), delay);
    },
    [delay]
  );

  const flush = useCallback((...args) => {
    if (timer.current) clearTimeout(timer.current);
    fnRef.current(...args);
  }, []);

  useEffect(() => () => timer.current && clearTimeout(timer.current), []);

  return { debounced, flush };
}
