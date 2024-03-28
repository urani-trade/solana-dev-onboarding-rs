import React from 'react';
export const WalletIcon = ({ wallet, ...props }) => {
    return wallet && React.createElement("img", { src: wallet.adapter.icon, alt: `${wallet.adapter.name} icon`, ...props });
};
//# sourceMappingURL=WalletIcon.js.map