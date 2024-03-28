import React from 'react';
export declare function useLocalStorage<T>(key: string, defaultState: T): [T, React.Dispatch<React.SetStateAction<T>>];
