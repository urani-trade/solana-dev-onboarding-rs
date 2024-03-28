"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.readableStreamTee = readableStreamTee;
exports.pipeTo = pipeTo;
exports.pipeThrough = pipeThrough;
exports.chainStreams = chainStreams;
exports.streamFromArray = streamFromArray;
exports.streamToString = streamToString;
exports.encodeText = encodeText;
exports.decodeText = decodeText;
exports.createTransformStream = createTransformStream;
exports.createBufferedTransformStream = createBufferedTransformStream;
exports.createFlushEffectStream = createFlushEffectStream;
exports.renderToStream = renderToStream;
exports.createSuffixStream = createSuffixStream;
exports.createPrefixStream = createPrefixStream;
exports.createInlineDataStream = createInlineDataStream;
function readableStreamTee(readable) {
    const transformStream = new TransformStream();
    const transformStream2 = new TransformStream();
    const writer = transformStream.writable.getWriter();
    const writer2 = transformStream2.writable.getWriter();
    const reader = readable.getReader();
    function read() {
        reader.read().then(({ done , value  })=>{
            if (done) {
                writer.close();
                writer2.close();
                return;
            }
            writer.write(value);
            writer2.write(value);
            read();
        });
    }
    read();
    return [
        transformStream.readable,
        transformStream2.readable
    ];
}
function pipeTo(readable, writable, options) {
    let resolver;
    const promise = new Promise((resolve)=>resolver = resolve
    );
    const reader = readable.getReader();
    const writer = writable.getWriter();
    function process() {
        reader.read().then(({ done , value  })=>{
            if (done) {
                if (options === null || options === void 0 ? void 0 : options.preventClose) {
                    writer.releaseLock();
                } else {
                    writer.close();
                }
                resolver();
            } else {
                writer.write(value);
                process();
            }
        });
    }
    process();
    return promise;
}
function pipeThrough(readable, transformStream) {
    pipeTo(readable, transformStream.writable);
    return transformStream.readable;
}
function chainStreams(streams) {
    const { readable , writable  } = new TransformStream();
    let promise = Promise.resolve();
    for(let i = 0; i < streams.length; ++i){
        promise = promise.then(()=>pipeTo(streams[i], writable, {
                preventClose: i + 1 < streams.length
            })
        );
    }
    return readable;
}
function streamFromArray(strings) {
    // Note: we use a TransformStream here instead of instantiating a ReadableStream
    // because the built-in ReadableStream polyfill runs strings through TextEncoder.
    const { readable , writable  } = new TransformStream();
    const writer = writable.getWriter();
    strings.forEach((str)=>writer.write(encodeText(str))
    );
    writer.close();
    return readable;
}
async function streamToString(stream) {
    const reader = stream.getReader();
    let bufferedString = '';
    while(true){
        const { done , value  } = await reader.read();
        if (done) {
            return bufferedString;
        }
        bufferedString += decodeText(value);
    }
}
function encodeText(input) {
    return new TextEncoder().encode(input);
}
function decodeText(input) {
    return new TextDecoder().decode(input);
}
function createTransformStream({ flush , transform  }) {
    const source = new TransformStream();
    const sink = new TransformStream();
    const reader = source.readable.getReader();
    const writer = sink.writable.getWriter();
    const controller = {
        enqueue (chunk) {
            writer.write(chunk);
        },
        error (reason) {
            writer.abort(reason);
            reader.cancel();
        },
        terminate () {
            writer.close();
            reader.cancel();
        },
        get desiredSize () {
            return writer.desiredSize;
        }
    };
    (async ()=>{
        try {
            while(true){
                const { done , value  } = await reader.read();
                if (done) {
                    const maybePromise = flush === null || flush === void 0 ? void 0 : flush(controller);
                    if (maybePromise) {
                        await maybePromise;
                    }
                    writer.close();
                    return;
                }
                if (transform) {
                    const maybePromise = transform(value, controller);
                    if (maybePromise) {
                        await maybePromise;
                    }
                } else {
                    controller.enqueue(value);
                }
            }
        } catch (err) {
            writer.abort(err);
        }
    })();
    return {
        readable: sink.readable,
        writable: source.writable
    };
}
function createBufferedTransformStream() {
    let bufferedString = '';
    let pendingFlush = null;
    const flushBuffer = (controller)=>{
        if (!pendingFlush) {
            pendingFlush = new Promise((resolve)=>{
                setTimeout(()=>{
                    controller.enqueue(encodeText(bufferedString));
                    bufferedString = '';
                    pendingFlush = null;
                    resolve();
                }, 0);
            });
        }
        return pendingFlush;
    };
    return createTransformStream({
        transform (chunk, controller) {
            bufferedString += decodeText(chunk);
            flushBuffer(controller);
        },
        flush () {
            if (pendingFlush) {
                return pendingFlush;
            }
        }
    });
}
function createFlushEffectStream(handleFlushEffect) {
    return createTransformStream({
        async transform (chunk, controller) {
            const extraChunk = await handleFlushEffect();
            // those should flush together at once
            controller.enqueue(encodeText(extraChunk + decodeText(chunk)));
        }
    });
}
async function renderToStream({ ReactDOMServer , element , suffix , dataStream , generateStaticHTML , flushEffectHandler  }) {
    const closeTag = '</body></html>';
    const suffixUnclosed = suffix ? suffix.split(closeTag)[0] : null;
    const renderStream = await ReactDOMServer.renderToReadableStream(element);
    if (generateStaticHTML) {
        await renderStream.allReady;
    }
    const transforms = [
        createBufferedTransformStream(),
        flushEffectHandler ? createFlushEffectStream(flushEffectHandler) : null,
        suffixUnclosed != null ? createPrefixStream(suffixUnclosed) : null,
        dataStream ? createInlineDataStream(dataStream) : null,
        suffixUnclosed != null ? createSuffixStream(closeTag) : null, 
    ].filter(Boolean);
    return transforms.reduce((readable, transform)=>pipeThrough(readable, transform)
    , renderStream);
}
function createSuffixStream(suffix) {
    return createTransformStream({
        flush (controller) {
            if (suffix) {
                controller.enqueue(encodeText(suffix));
            }
        }
    });
}
function createPrefixStream(prefix) {
    let prefixFlushed = false;
    let prefixPrefixFlushFinished = null;
    return createTransformStream({
        transform (chunk, controller) {
            controller.enqueue(chunk);
            if (!prefixFlushed && prefix) {
                prefixFlushed = true;
                prefixPrefixFlushFinished = new Promise((res)=>{
                    // NOTE: streaming flush
                    // Enqueue prefix part before the major chunks are enqueued so that
                    // prefix won't be flushed too early to interrupt the data stream
                    setTimeout(()=>{
                        controller.enqueue(encodeText(prefix));
                        res();
                    });
                });
            }
        },
        flush (controller) {
            if (prefixPrefixFlushFinished) return prefixPrefixFlushFinished;
            if (!prefixFlushed && prefix) {
                prefixFlushed = true;
                controller.enqueue(encodeText(prefix));
            }
        }
    });
}
function createInlineDataStream(dataStream) {
    let dataStreamFinished = null;
    return createTransformStream({
        transform (chunk, controller) {
            controller.enqueue(chunk);
            if (!dataStreamFinished) {
                const dataStreamReader = dataStream.getReader();
                // NOTE: streaming flush
                // We are buffering here for the inlined data stream because the
                // "shell" stream might be chunkenized again by the underlying stream
                // implementation, e.g. with a specific high-water mark. To ensure it's
                // the safe timing to pipe the data stream, this extra tick is
                // necessary.
                dataStreamFinished = new Promise((res)=>setTimeout(async ()=>{
                        try {
                            while(true){
                                const { done , value  } = await dataStreamReader.read();
                                if (done) {
                                    return res();
                                }
                                controller.enqueue(value);
                            }
                        } catch (err) {
                            controller.error(err);
                        }
                        res();
                    }, 0)
                );
            }
        },
        flush () {
            if (dataStreamFinished) {
                return dataStreamFinished;
            }
        }
    });
}

//# sourceMappingURL=node-web-streams-helper.js.map