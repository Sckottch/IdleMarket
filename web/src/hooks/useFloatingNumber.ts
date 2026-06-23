import { useCallback, useRef, useState } from "react";

export function useFloatingNumber(duration = 1000) {
  const [value, setValue] = useState<number | null>(null);
  const idRef = useRef(0);

  const trigger = useCallback((v: number) => {
    const id = ++idRef.current;
    setValue(v);
    setTimeout(() => {
      if (idRef.current === id) setValue(null);
    }, duration);
  }, [duration]);

  return { value, trigger };
}
