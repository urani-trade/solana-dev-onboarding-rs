import { Connection } from '@solana/web3.js';
import React, { useMemo } from 'react';
import { ConnectionContext } from './useConnection.mjs';
export const ConnectionProvider = ({ children, endpoint, config = { commitment: 'confirmed' }, }) => {
    const connection = useMemo(() => new Connection(endpoint, config), [endpoint, config]);
    return React.createElement(ConnectionContext.Provider, { value: { connection } }, children);
};
//# sourceMappingURL=ConnectionProvider.js.map