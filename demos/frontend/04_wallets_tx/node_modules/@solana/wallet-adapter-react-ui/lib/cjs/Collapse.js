"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Collapse = void 0;
const react_1 = __importStar(require("react"));
const Collapse = ({ id, children, expanded = false }) => {
    const ref = (0, react_1.useRef)(null);
    const instant = (0, react_1.useRef)(true);
    const transition = 'height 250ms ease-out';
    const openCollapse = () => {
        const node = ref.current;
        if (!node)
            return;
        requestAnimationFrame(() => {
            node.style.height = node.scrollHeight + 'px';
        });
    };
    const closeCollapse = () => {
        const node = ref.current;
        if (!node)
            return;
        requestAnimationFrame(() => {
            node.style.height = node.offsetHeight + 'px';
            node.style.overflow = 'hidden';
            requestAnimationFrame(() => {
                node.style.height = '0';
            });
        });
    };
    (0, react_1.useLayoutEffect)(() => {
        if (expanded) {
            openCollapse();
        }
        else {
            closeCollapse();
        }
    }, [expanded]);
    (0, react_1.useLayoutEffect)(() => {
        const node = ref.current;
        if (!node)
            return;
        function handleComplete() {
            if (!node)
                return;
            node.style.overflow = expanded ? 'initial' : 'hidden';
            if (expanded) {
                node.style.height = 'auto';
            }
        }
        function handleTransitionEnd(event) {
            if (node && event.target === node && event.propertyName === 'height') {
                handleComplete();
            }
        }
        if (instant.current) {
            handleComplete();
            instant.current = false;
        }
        node.addEventListener('transitionend', handleTransitionEnd);
        return () => node.removeEventListener('transitionend', handleTransitionEnd);
    }, [expanded]);
    return (react_1.default.createElement("div", { children: children, className: "wallet-adapter-collapse", id: id, ref: ref, role: "region", style: { height: 0, transition: instant.current ? undefined : transition } }));
};
exports.Collapse = Collapse;
//# sourceMappingURL=Collapse.js.map