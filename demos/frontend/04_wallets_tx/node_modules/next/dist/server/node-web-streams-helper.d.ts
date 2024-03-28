/// <reference types="react" />
export declare function readableStreamTee<T = any>(readable: ReadableStream<T>): [ReadableStream<T>, ReadableStream<T>];
export declare function pipeTo<T>(readable: ReadableStream<T>, writable: WritableStream<T>, options?: {
    preventClose: boolean;
}): Promise<void>;
export declare function pipeThrough<Input, Output>(readable: ReadableStream<Input>, transformStream: TransformStream<Input, Output>): ReadableStream<Output>;
export declare function chainStreams<T>(streams: ReadableStream<T>[]): ReadableStream<T>;
export declare function streamFromArray(strings: string[]): ReadableStream<Uint8Array>;
export declare function streamToString(stream: ReadableStream<Uint8Array>): Promise<string>;
export declare function encodeText(input: string): Uint8Array;
export declare function decodeText(input?: Uint8Array): string;
export declare function createTransformStream<Input, Output>({ flush, transform, }: {
    flush?: (controller: TransformStreamDefaultController<Output>) => Promise<void> | void;
    transform?: (chunk: Input, controller: TransformStreamDefaultController<Output>) => Promise<void> | void;
}): TransformStream<Input, Output>;
export declare function createBufferedTransformStream(): TransformStream<Uint8Array, Uint8Array>;
export declare function createFlushEffectStream(handleFlushEffect: () => Promise<string>): TransformStream<Uint8Array, Uint8Array>;
export declare function renderToStream({ ReactDOMServer, element, suffix, dataStream, generateStaticHTML, flushEffectHandler, }: {
    ReactDOMServer: typeof import('react-dom/server');
    element: React.ReactElement;
    suffix?: string;
    dataStream?: ReadableStream<Uint8Array>;
    generateStaticHTML: boolean;
    flushEffectHandler?: () => Promise<string>;
}): Promise<ReadableStream<Uint8Array>>;
export declare function createSuffixStream(suffix: string): TransformStream<Uint8Array, Uint8Array>;
export declare function createPrefixStream(prefix: string): TransformStream<Uint8Array, Uint8Array>;
export declare function createInlineDataStream(dataStream: ReadableStream<Uint8Array>): TransformStream<Uint8Array, Uint8Array>;
