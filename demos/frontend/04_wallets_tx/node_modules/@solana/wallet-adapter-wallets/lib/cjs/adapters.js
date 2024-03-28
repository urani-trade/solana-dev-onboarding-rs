"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWalletAdapters = void 0;
const wallet_adapter_base_1 = require("@solana/wallet-adapter-base");
const wallet_adapter_bitkeep_1 = require("@solana/wallet-adapter-bitkeep");
const wallet_adapter_bitpie_1 = require("@solana/wallet-adapter-bitpie");
const wallet_adapter_blocto_1 = require("@solana/wallet-adapter-blocto");
const wallet_adapter_clover_1 = require("@solana/wallet-adapter-clover");
const wallet_adapter_coin98_1 = require("@solana/wallet-adapter-coin98");
const wallet_adapter_coinhub_1 = require("@solana/wallet-adapter-coinhub");
const wallet_adapter_huobi_1 = require("@solana/wallet-adapter-huobi");
const wallet_adapter_ledger_1 = require("@solana/wallet-adapter-ledger");
const wallet_adapter_mathwallet_1 = require("@solana/wallet-adapter-mathwallet");
const wallet_adapter_glow_1 = require("@solana/wallet-adapter-glow");
const wallet_adapter_phantom_1 = require("@solana/wallet-adapter-phantom");
const wallet_adapter_safepal_1 = require("@solana/wallet-adapter-safepal");
const wallet_adapter_slope_1 = require("@solana/wallet-adapter-slope");
const wallet_adapter_solflare_1 = require("@solana/wallet-adapter-solflare");
const wallet_adapter_sollet_1 = require("@solana/wallet-adapter-sollet");
const wallet_adapter_solong_1 = require("@solana/wallet-adapter-solong");
const wallet_adapter_tokenpocket_1 = require("@solana/wallet-adapter-tokenpocket");
const wallet_adapter_torus_1 = require("@solana/wallet-adapter-torus");
function getWalletAdapters({ network = wallet_adapter_base_1.WalletAdapterNetwork.Mainnet } = {}) {
    return [
        new wallet_adapter_phantom_1.PhantomWalletAdapter(),
        new wallet_adapter_glow_1.GlowWalletAdapter(),
        new wallet_adapter_slope_1.SlopeWalletAdapter(),
        new wallet_adapter_solflare_1.SolflareWalletAdapter({ network }),
        new wallet_adapter_sollet_1.SolletExtensionWalletAdapter({ network }),
        new wallet_adapter_bitkeep_1.BitKeepWalletAdapter(),
        new wallet_adapter_bitpie_1.BitpieWalletAdapter(),
        new wallet_adapter_clover_1.CloverWalletAdapter(),
        new wallet_adapter_coin98_1.Coin98WalletAdapter(),
        new wallet_adapter_coinhub_1.CoinhubWalletAdapter(),
        new wallet_adapter_huobi_1.HuobiWalletAdapter(),
        new wallet_adapter_mathwallet_1.MathWalletAdapter(),
        new wallet_adapter_safepal_1.SafePalWalletAdapter(),
        new wallet_adapter_solong_1.SolongWalletAdapter(),
        new wallet_adapter_tokenpocket_1.TokenPocketWalletAdapter(),
        new wallet_adapter_torus_1.TorusWalletAdapter(),
        new wallet_adapter_ledger_1.LedgerWalletAdapter(),
        new wallet_adapter_sollet_1.SolletWalletAdapter({ network }),
        new wallet_adapter_blocto_1.BloctoWalletAdapter({ network }),
    ];
}
exports.getWalletAdapters = getWalletAdapters;
//# sourceMappingURL=adapters.js.map