/// <reference types="node" />
export declare type WasmBinding = {
    filePath: string;
    name: string;
};
export default function MiddlewareWasmLoader(this: any, source: Buffer): string;
export declare const raw = true;
