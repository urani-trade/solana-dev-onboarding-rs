import { createContext, useContext } from 'react';
export const ConnectionContext = createContext({});
export function useConnection() {
    return useContext(ConnectionContext);
}
//# sourceMappingURL=useConnection.js.map