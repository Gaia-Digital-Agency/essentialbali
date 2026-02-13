import { useEffect, useState } from "react";
import { useBlocker } from "react-router-dom";

export function useNavigationPrompt() {
    const [isDirty, setIsDirty] = useState<boolean>(false)

    const blocker = useBlocker(
        ({ currentLocation, nextLocation }) => isDirty && currentLocation.pathname !== nextLocation.pathname
    );

    useEffect(() => {
        if (blocker.state === 'blocked') {
            if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
                blocker.proceed?.();
            } else {
                blocker.reset?.();
            }
        }
    }, [blocker]);
    // Also alert when page is refreshed
    useEffect(() => {
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            event.preventDefault();
            event.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        };

        if (isDirty) {
            window.addEventListener('beforeunload', handleBeforeUnload);
        }
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [isDirty]);

    const setBlock = (bool: boolean) => setIsDirty(bool)

    return {isDirty, setBlock}
}
