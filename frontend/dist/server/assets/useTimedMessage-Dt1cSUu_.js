import { useEffect } from "react";
function useAutoDismiss(value, setValue, delay = 3e3) {
  useEffect(() => {
    if (value) {
      const timer = setTimeout(() => setValue(null), delay);
      return () => clearTimeout(timer);
    }
  }, [value, setValue, delay]);
}
export {
  useAutoDismiss as u
};
