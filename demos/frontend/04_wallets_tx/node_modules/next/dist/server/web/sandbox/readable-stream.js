"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.ReadableStream = void 0;
class ReadableStream {
    constructor(opts = {}){
        let closed = false;
        let pullPromise;
        let transformController;
        const { readable , writable  } = new TransformStream({
            start: (controller)=>{
                transformController = controller;
            }
        }, undefined, {
            highWaterMark: 1
        });
        const writer = writable.getWriter();
        const encoder = new TextEncoder();
        const controller1 = {
            get desiredSize () {
                return transformController.desiredSize;
            },
            close: ()=>{
                if (!closed) {
                    closed = true;
                    writer.close();
                }
            },
            enqueue: (chunk)=>{
                writer.write(typeof chunk === 'string' ? encoder.encode(chunk) : chunk);
                pull();
            },
            error: (reason)=>{
                transformController.error(reason);
            }
        };
        const pull = ()=>{
            if (opts.pull) {
                const shouldPull = controller1.desiredSize !== null && controller1.desiredSize > 0;
                if (!pullPromise && shouldPull) {
                    pullPromise = Promise.resolve().then(()=>{
                        pullPromise = 0;
                        opts.pull(controller1);
                    });
                    return pullPromise;
                }
            }
            return Promise.resolve();
        };
        if (opts.cancel) {
            readable.cancel = (reason)=>{
                opts.cancel(reason);
                return readable.cancel(reason);
            };
        }
        function registerPull() {
            const getReader = readable.getReader.bind(readable);
            readable.getReader = ()=>{
                pull();
                return getReader();
            };
        }
        const started = opts.start && opts.start(controller1);
        if (started && typeof started.then === 'function') {
            started.then(()=>registerPull()
            );
        } else {
            registerPull();
        }
        return readable;
    }
}
exports.ReadableStream = ReadableStream;

//# sourceMappingURL=readable-stream.js.map