"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useConnection = exports.ConnectionContext = void 0;
const react_1 = require("react");
exports.ConnectionContext = (0, react_1.createContext)({});
function useConnection() {
    return (0, react_1.useContext)(exports.ConnectionContext);
}
exports.useConnection = useConnection;
//# sourceMappingURL=useConnection.js.map