import { Crypto as WebCrypto } from 'next/dist/compiled/@peculiar/webcrypto';
import { CryptoKey } from 'next/dist/compiled/@peculiar/webcrypto';
import processPolyfill from 'next/dist/compiled/process';
import { ReadableStream } from './readable-stream';
export declare function atob(b64Encoded: string): string;
export declare function btoa(str: string): string;
export { CryptoKey, ReadableStream, processPolyfill as process };
export declare class Crypto extends WebCrypto {
    randomUUID: any;
}
