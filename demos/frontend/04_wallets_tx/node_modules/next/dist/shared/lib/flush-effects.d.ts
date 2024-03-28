/// <reference types="react" />
export declare type FlushEffectsHook = (callbacks: Array<() => React.ReactNode>) => void;
export declare const FlushEffectsContext: React.Context<FlushEffectsHook | null>;
export declare function useFlushEffects(callbacks: Array<() => React.ReactNode>): void;
