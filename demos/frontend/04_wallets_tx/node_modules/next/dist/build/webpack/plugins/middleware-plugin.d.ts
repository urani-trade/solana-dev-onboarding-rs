import { webpack5 } from 'next/dist/compiled/webpack/webpack';
import type { WasmBinding } from '../loaders/next-middleware-wasm-loader';
export declare const ssrEntries: Map<string, {
    requireFlightManifest: boolean;
}>;
export interface MiddlewareManifest {
    version: 1;
    sortedMiddleware: string[];
    clientInfo: [location: string, isSSR: boolean][];
    middleware: {
        [page: string]: {
            env: string[];
            files: string[];
            name: string;
            page: string;
            regexp: string;
            wasm?: WasmBinding[];
        };
    };
}
export declare type PerRoute = {
    envPerRoute: Map<string, string[]>;
    wasmPerRoute: Map<string, WasmBinding[]>;
};
export declare function getEntrypointInfo(compilation: webpack5.Compilation, { envPerRoute, wasmPerRoute }: PerRoute, isEdgeRuntime: boolean): {
    env: string[];
    wasm: WasmBinding[];
    files: string[];
    name: string;
    page: string;
    regexp: string;
}[];
export default class MiddlewarePlugin {
    dev: boolean;
    isEdgeRuntime: boolean;
    constructor({ dev, isEdgeRuntime, }: {
        dev: boolean;
        isEdgeRuntime: boolean;
    });
    createAssets(compilation: webpack5.Compilation, assets: any, { envPerRoute, wasmPerRoute }: PerRoute, isEdgeRuntime: boolean): void;
    apply(compiler: webpack5.Compiler): void;
}
export declare function collectAssets(compiler: webpack5.Compiler, createAssets: (compilation: webpack5.Compilation, assets: any, { envPerRoute, wasmPerRoute }: PerRoute, isEdgeRuntime: boolean) => void, options: {
    dev: boolean;
    pluginName: string;
    isEdgeRuntime: boolean;
}): void;
