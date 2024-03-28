import { useEffect, useRef, useState } from 'react';
export function useLocalStorage(key, defaultState) {
    const state = useState(() => {
        try {
            const value = localStorage.getItem(key);
            if (value)
                return JSON.parse(value);
        }
        catch (error) {
            if (typeof window !== 'undefined') {
                console.error(error);
            }
        }
        return defaultState;
    });
    const value = state[0];
    const isFirstRender = useRef(true);
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        try {
            if (value === null) {
                localStorage.removeItem(key);
            }
            else {
                localStorage.setItem(key, JSON.stringify(value));
            }
        }
        catch (error) {
            if (typeof window !== 'undefined') {
                console.error(error);
            }
        }
    }, [value]);
    return state;
}
//# sourceMappingURL=useLocalStorage.js.map