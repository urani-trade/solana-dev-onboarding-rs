"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useLocalStorage = void 0;
const react_1 = require("react");
function useLocalStorage(key, defaultState) {
    const state = (0, react_1.useState)(() => {
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
    const isFirstRender = (0, react_1.useRef)(true);
    (0, react_1.useEffect)(() => {
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
exports.useLocalStorage = useLocalStorage;
//# sourceMappingURL=useLocalStorage.js.map