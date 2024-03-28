import { webpack5 } from 'next/dist/compiled/webpack/webpack';
import { PerRoute } from './middleware-plugin';
export interface FunctionsManifest {
    version: 1;
    pages: {
        [page: string]: {
            runtime?: string;
            env: string[];
            files: string[];
            name: string;
            page: string;
            regexp: string;
        };
    };
}
export default class FunctionsManifestPlugin {
    dev: boolean;
    pagesDir: string;
    pageExtensions: string[];
    isEdgeRuntime: boolean;
    pagesRuntime: Map<string, string>;
    constructor({ dev, pagesDir, pageExtensions, isEdgeRuntime, }: {
        dev: boolean;
        pagesDir: string;
        pageExtensions: string[];
        isEdgeRuntime: boolean;
    });
    createAssets(compilation: webpack5.Compilation, assets: any, perRoute: PerRoute, isEdgeRuntime: boolean): void;
    apply(compiler: webpack5.Compiler): void;
}
