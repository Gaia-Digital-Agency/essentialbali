import { useState, useEffect } from "react";
import { useBlocker } from "react-router-dom";
function useNavigationPrompt() {
  const [isDirty, setIsDirty] = useState(false);
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) => isDirty && currentLocation.pathname !== nextLocation.pathname
  );
  useEffect(() => {
    var _a, _b;
    if (blocker.state === "blocked") {
      if (window.confirm("You have unsaved changes. Are you sure you want to leave?")) {
        (_a = blocker.proceed) == null ? void 0 : _a.call(blocker);
      } else {
        (_b = blocker.reset) == null ? void 0 : _b.call(blocker);
      }
    }
  }, [blocker]);
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = "You have unsaved changes. Are you sure you want to leave?";
    };
    if (isDirty) {
      window.addEventListener("beforeunload", handleBeforeUnload);
    }
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isDirty]);
  const setBlock = (bool) => setIsDirty(bool);
  return { isDirty, setBlock };
}
export {
  useNavigationPrompt as u
};
