"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.useFlushEffects = useFlushEffects;
exports.FlushEffectsContext = void 0;
var _react = require("react");
const FlushEffectsContext = (0, _react).createContext(null);
exports.FlushEffectsContext = FlushEffectsContext;
function useFlushEffects(callbacks) {
    const flushEffectsImpl = (0, _react).useContext(FlushEffectsContext);
    if (!flushEffectsImpl) {
        throw new Error(`useFlushEffects can not be called on the client.` + `\nRead more: https://nextjs.org/docs/messages/client-flush-effects`);
    }
    return flushEffectsImpl(callbacks);
}
if (process.env.NODE_ENV !== 'production') {
    FlushEffectsContext.displayName = 'FlushEffectsContext';
}

//# sourceMappingURL=flush-effects.js.map