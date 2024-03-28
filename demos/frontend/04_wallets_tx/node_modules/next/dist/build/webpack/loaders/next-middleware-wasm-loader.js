"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = MiddlewareWasmLoader;
exports.raw = void 0;
var _crypto = _interopRequireDefault(require("crypto"));
function MiddlewareWasmLoader(source) {
    const name = `wasm_${sha1(source)}`;
    const filePath = `server/middleware-chunks/${name}.wasm`;
    const binding = {
        filePath,
        name
    };
    this._module.buildInfo.nextWasmMiddlewareBinding = binding;
    this.emitFile(`/${filePath}`, source, null);
    return `module.exports = ${name};`;
}
function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const raw = true;
exports.raw = raw;
function sha1(source) {
    return _crypto.default.createHash('sha1').update(source).digest('hex');
}

//# sourceMappingURL=next-middleware-wasm-loader.js.map