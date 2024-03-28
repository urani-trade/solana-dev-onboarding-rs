"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = void 0;
var _renderResult = _interopRequireDefault(require("./render-result"));
function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
class ResponseCache {
    constructor(incrementalCache, minimalMode){
        this.incrementalCache = incrementalCache;
        this.pendingResponses = new Map();
        this.minimalMode = minimalMode;
    }
    get(key, responseGenerator, context) {
        var ref2;
        const pendingResponse = key ? this.pendingResponses.get(key) : null;
        if (pendingResponse) {
            return pendingResponse;
        }
        let resolver = ()=>{};
        let rejecter = ()=>{};
        const promise = new Promise((resolve, reject)=>{
            resolver = resolve;
            rejecter = reject;
        });
        if (key) {
            this.pendingResponses.set(key, promise);
        }
        let resolved = false;
        const resolve1 = (cacheEntry)=>{
            if (key) {
                // Ensure all reads from the cache get the latest value.
                this.pendingResponses.set(key, Promise.resolve(cacheEntry));
            }
            if (!resolved) {
                resolved = true;
                resolver(cacheEntry);
            }
        };
        // we keep the previous cache entry around to leverage
        // when the incremental cache is disabled in minimal mode
        if (key && this.minimalMode && ((ref2 = this.previousCacheItem) === null || ref2 === void 0 ? void 0 : ref2.key) === key && this.previousCacheItem.expiresAt > Date.now()) {
            resolve1(this.previousCacheItem.entry);
            this.pendingResponses.delete(key);
            return promise;
        }
        (async ()=>{
            let cachedResponse = null;
            try {
                cachedResponse = key && !this.minimalMode ? await this.incrementalCache.get(key) : null;
                if (cachedResponse && !context.isManualRevalidate) {
                    var ref;
                    resolve1({
                        isStale: cachedResponse.isStale,
                        revalidate: cachedResponse.curRevalidate,
                        value: ((ref = cachedResponse.value) === null || ref === void 0 ? void 0 : ref.kind) === 'PAGE' ? {
                            kind: 'PAGE',
                            html: _renderResult.default.fromStatic(cachedResponse.value.html),
                            pageData: cachedResponse.value.pageData
                        } : cachedResponse.value
                    });
                    if (!cachedResponse.isStale) {
                        // The cached value is still valid, so we don't need
                        // to update it yet.
                        return;
                    }
                }
                const cacheEntry = await responseGenerator(resolved, !!cachedResponse);
                resolve1(cacheEntry === null ? null : {
                    ...cacheEntry,
                    isMiss: !cachedResponse
                });
                if (key && cacheEntry && typeof cacheEntry.revalidate !== 'undefined') {
                    if (this.minimalMode) {
                        this.previousCacheItem = {
                            key,
                            entry: cacheEntry,
                            expiresAt: typeof cacheEntry.revalidate !== 'number' ? Date.now() + 1000 : Date.now() + (cacheEntry === null || cacheEntry === void 0 ? void 0 : cacheEntry.revalidate) * 1000
                        };
                    } else {
                        var ref1;
                        await this.incrementalCache.set(key, ((ref1 = cacheEntry.value) === null || ref1 === void 0 ? void 0 : ref1.kind) === 'PAGE' ? {
                            kind: 'PAGE',
                            html: cacheEntry.value.html.toUnchunkedString(),
                            pageData: cacheEntry.value.pageData
                        } : cacheEntry.value, cacheEntry.revalidate);
                    }
                } else {
                    this.previousCacheItem = undefined;
                }
            } catch (err) {
                // when a getStaticProps path is erroring we automatically re-set the
                // existing cache under a new expiration to prevent non-stop retrying
                if (cachedResponse && key) {
                    await this.incrementalCache.set(key, cachedResponse.value, Math.min(Math.max(cachedResponse.revalidate || 3, 3), 30));
                }
                // while revalidating in the background we can't reject as
                // we already resolved the cache entry so log the error here
                if (resolved) {
                    console.error(err);
                } else {
                    rejecter(err);
                }
            } finally{
                if (key) {
                    this.pendingResponses.delete(key);
                }
            }
        })();
        return promise;
    }
}
exports.default = ResponseCache;

//# sourceMappingURL=response-cache.js.map