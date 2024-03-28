"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getParserOptions = getParserOptions;
exports.getJestSWCOptions = getJestSWCOptions;
exports.getLoaderSWCOptions = getLoaderSWCOptions;
const nextDistPath = /(next[\\/]dist[\\/]shared[\\/]lib)|(next[\\/]dist[\\/]client)|(next[\\/]dist[\\/]pages)/;
const regeneratorRuntimePath = require.resolve('next/dist/compiled/regenerator-runtime');
function getParserOptions({ filename , jsConfig , ...rest }) {
    var ref;
    const isTSFile = filename.endsWith('.ts');
    const isTypeScript = isTSFile || filename.endsWith('.tsx');
    const enableDecorators = Boolean(jsConfig === null || jsConfig === void 0 ? void 0 : (ref = jsConfig.compilerOptions) === null || ref === void 0 ? void 0 : ref.experimentalDecorators);
    return {
        ...rest,
        syntax: isTypeScript ? 'typescript' : 'ecmascript',
        dynamicImport: true,
        decorators: enableDecorators,
        // Exclude regular TypeScript files from React transformation to prevent e.g. generic parameters and angle-bracket type assertion from being interpreted as JSX tags.
        [isTypeScript ? 'tsx' : 'jsx']: isTSFile ? false : true,
        importAssertions: true
    };
}
function getBaseSWCOptions({ filename , jest , development , hasReactRefresh , globalWindow , nextConfig , resolvedBaseUrl , jsConfig ,  }) {
    var ref, ref1, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9;
    const parserConfig = getParserOptions({
        filename,
        jsConfig
    });
    const paths = jsConfig === null || jsConfig === void 0 ? void 0 : (ref = jsConfig.compilerOptions) === null || ref === void 0 ? void 0 : ref.paths;
    const enableDecorators = Boolean(jsConfig === null || jsConfig === void 0 ? void 0 : (ref1 = jsConfig.compilerOptions) === null || ref1 === void 0 ? void 0 : ref1.experimentalDecorators);
    const emitDecoratorMetadata = Boolean(jsConfig === null || jsConfig === void 0 ? void 0 : (ref2 = jsConfig.compilerOptions) === null || ref2 === void 0 ? void 0 : ref2.emitDecoratorMetadata);
    return {
        jsc: {
            ...resolvedBaseUrl && paths ? {
                baseUrl: resolvedBaseUrl,
                paths
            } : {},
            parser: parserConfig,
            experimental: {
                keepImportAssertions: true
            },
            transform: {
                // Enables https://github.com/swc-project/swc/blob/0359deb4841be743d73db4536d4a22ac797d7f65/crates/swc_ecma_ext_transforms/src/jest.rs
                ...jest ? {
                    hidden: {
                        jest: true
                    }
                } : {},
                legacyDecorator: enableDecorators,
                decoratorMetadata: emitDecoratorMetadata,
                react: {
                    importSource: (nextConfig === null || nextConfig === void 0 ? void 0 : (ref3 = nextConfig.experimental) === null || ref3 === void 0 ? void 0 : ref3.emotion) ? '@emotion/react' : (jsConfig === null || jsConfig === void 0 ? void 0 : (ref4 = jsConfig.compilerOptions) === null || ref4 === void 0 ? void 0 : ref4.jsxImportSource) || 'react',
                    runtime: 'automatic',
                    pragma: 'React.createElement',
                    pragmaFrag: 'React.Fragment',
                    throwIfNamespace: true,
                    development: !!development,
                    useBuiltins: true,
                    refresh: !!hasReactRefresh
                },
                optimizer: {
                    simplify: false,
                    globals: jest ? null : {
                        typeofs: {
                            window: globalWindow ? 'object' : 'undefined'
                        },
                        envs: {
                            NODE_ENV: development ? '"development"' : '"production"'
                        }
                    }
                },
                regenerator: {
                    importPath: regeneratorRuntimePath
                }
            }
        },
        sourceMaps: jest ? 'inline' : undefined,
        styledComponents: (nextConfig === null || nextConfig === void 0 ? void 0 : (ref5 = nextConfig.compiler) === null || ref5 === void 0 ? void 0 : ref5.styledComponents) ? {
            displayName: Boolean(development)
        } : null,
        removeConsole: nextConfig === null || nextConfig === void 0 ? void 0 : (ref6 = nextConfig.compiler) === null || ref6 === void 0 ? void 0 : ref6.removeConsole,
        reactRemoveProperties: nextConfig === null || nextConfig === void 0 ? void 0 : (ref7 = nextConfig.compiler) === null || ref7 === void 0 ? void 0 : ref7.reactRemoveProperties,
        modularizeImports: nextConfig === null || nextConfig === void 0 ? void 0 : (ref8 = nextConfig.experimental) === null || ref8 === void 0 ? void 0 : ref8.modularizeImports,
        relay: nextConfig === null || nextConfig === void 0 ? void 0 : (ref9 = nextConfig.compiler) === null || ref9 === void 0 ? void 0 : ref9.relay,
        emotion: getEmotionOptions(nextConfig, development)
    };
}
function getEmotionOptions(nextConfig, development) {
    var ref, ref10, ref11, ref12, ref13, ref14, ref15;
    if (!(nextConfig === null || nextConfig === void 0 ? void 0 : (ref = nextConfig.experimental) === null || ref === void 0 ? void 0 : ref.emotion)) {
        return null;
    }
    let autoLabel = false;
    switch(nextConfig === null || nextConfig === void 0 ? void 0 : (ref10 = nextConfig.experimental) === null || ref10 === void 0 ? void 0 : (ref11 = ref10.emotion) === null || ref11 === void 0 ? void 0 : ref11.autoLabel){
        case 'never':
            autoLabel = false;
            break;
        case 'always':
            autoLabel = true;
            break;
        case 'dev-only':
        default:
            autoLabel = !!development;
            break;
    }
    var ref16;
    return {
        enabled: true,
        autoLabel,
        labelFormat: nextConfig === null || nextConfig === void 0 ? void 0 : (ref12 = nextConfig.experimental) === null || ref12 === void 0 ? void 0 : (ref13 = ref12.emotion) === null || ref13 === void 0 ? void 0 : ref13.labelFormat,
        sourcemap: development ? (ref16 = nextConfig === null || nextConfig === void 0 ? void 0 : (ref14 = nextConfig.experimental) === null || ref14 === void 0 ? void 0 : (ref15 = ref14.emotion) === null || ref15 === void 0 ? void 0 : ref15.sourceMap) !== null && ref16 !== void 0 ? ref16 : true : false
    };
}
function getJestSWCOptions({ isServer , filename , esm , nextConfig , jsConfig ,  }) {
    let baseOptions = getBaseSWCOptions({
        filename,
        jest: true,
        development: false,
        hasReactRefresh: false,
        globalWindow: !isServer,
        nextConfig,
        jsConfig
    });
    const isNextDist = nextDistPath.test(filename);
    return {
        ...baseOptions,
        env: {
            targets: {
                // Targets the current version of Node.js
                node: process.versions.node
            },
            // we always transpile optional chaining and nullish coalescing
            // since it can cause issues with webpack even if the node target
            // supports them
            include: [
                'proposal-optional-chaining',
                'proposal-nullish-coalescing-operator', 
            ]
        },
        module: {
            type: esm && !isNextDist ? 'es6' : 'commonjs'
        },
        disableNextSsg: true,
        disablePageConfig: true
    };
}
function getLoaderSWCOptions({ filename , development , isServer , pagesDir , isPageFile , hasReactRefresh , nextConfig , jsConfig ,  }) {
    let baseOptions = getBaseSWCOptions({
        filename,
        development,
        globalWindow: !isServer,
        hasReactRefresh,
        nextConfig,
        jsConfig
    });
    const isNextDist = nextDistPath.test(filename);
    if (isServer) {
        return {
            ...baseOptions,
            // Disables getStaticProps/getServerSideProps tree shaking on the server compilation for pages
            disableNextSsg: true,
            disablePageConfig: true,
            isDevelopment: development,
            isServer,
            pagesDir,
            isPageFile,
            env: {
                targets: {
                    // Targets the current version of Node.js
                    node: process.versions.node
                },
                // we always transpile optional chaining and nullish coalescing
                // since it can cause issues with webpack even if the node target
                // supports them
                include: [
                    'proposal-optional-chaining',
                    'proposal-nullish-coalescing-operator', 
                ]
            }
        };
    } else {
        // Matches default @babel/preset-env behavior
        baseOptions.jsc.target = 'es5';
        return {
            ...baseOptions,
            // Ensure Next.js internals are output as commonjs modules
            ...isNextDist ? {
                module: {
                    type: 'commonjs'
                }
            } : {},
            disableNextSsg: !isPageFile,
            isDevelopment: development,
            isServer,
            pagesDir,
            isPageFile
        };
    }
}

//# sourceMappingURL=options.js.map