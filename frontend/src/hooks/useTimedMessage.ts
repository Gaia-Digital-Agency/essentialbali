import { useEffect } from "react";

export default function useAutoDismiss<T>(
  value: T,
  setValue: (val: T) => void,
  delay = 3000
) {
  useEffect(() => {
    if (value) {
      const timer = setTimeout(() => setValue(null as T), delay);
      return () => clearTimeout(timer);
    }
  }, [value, setValue, delay]);
}
