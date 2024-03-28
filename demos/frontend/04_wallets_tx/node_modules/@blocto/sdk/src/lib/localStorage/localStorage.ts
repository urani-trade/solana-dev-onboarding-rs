import MemoryStorage from './memoryStorage';
import * as keys from './constants';

const isSupported = () => {
  if (typeof window === 'undefined') {
    return false;
  }
  try {
    window.localStorage.setItem('local_storage_supported', '1');
    const result = window.localStorage.getItem('local_storage_supported');
    window.localStorage.removeItem('local_storage_supported');
    return result === '1';
  } catch (error) {
    return false;
  }
};

const storage = isSupported() ? window.localStorage : MemoryStorage;

export const getItem = <T>(key: string, defaultValue: T | null = null): T | null => {
  const value = storage.getItem(key);

  try {
    return JSON.parse(value) || defaultValue;
  } catch (SyntaxError) {
    return value || defaultValue;
  }
};

export const getItemWithExpiry = <T>(key: string, defaultValue: T | null = null): T | null => {
  const rawExpiry: any = getItem(key, null);

  if (!rawExpiry) {
    return defaultValue;
  }

  // compare the expiry time of the item with the current time
  if ((new Date()).getTime() > rawExpiry.expiry) {
    // eslint-disable-next-line
    removeItem(key);
    return defaultValue;
  }

  return rawExpiry.value;
};

export const getRawItem = (key: string): string => storage.getItem(key);

export const setItem = (key: string, value: any): void =>
  storage.setItem(
    key,
    typeof value === 'string' ? value : JSON.stringify(value)
  );

export const setItemWithExpiry = (key: string, value: any, ttl: number): void =>
  setItem(
    key,
    {
      value,
      expiry: (new Date()).getTime() + ttl,
    }
  );

export const removeItem = (key: string): void => {
  setItem(key, ''); // Due to some versions of browser bug can't removeItem correctly.
  storage.removeItem(key);
};

export const isLatestLocalStorageVersion = (): boolean => {
  const LOCAL_STORAGE_VERSION = keys.LOCAL_STORAGE_VERSION;
  const localVersion = getItem(keys.KEY_LOCAL_STORAGE_VERSION);
  return LOCAL_STORAGE_VERSION === localVersion;
};

export const removeOutdatedKeys = (): void => {
  if (isLatestLocalStorageVersion()) return;

  setItem(keys.KEY_LOCAL_STORAGE_VERSION, keys.LOCAL_STORAGE_VERSION);

  const localDexscanKeys = Object.keys(localStorage).filter(key => key.indexOf('flow.') === 0);

  // Using 'Object.values()' fails unit testing because some browsers don't support it
  const dexscanKeys = Object.keys(keys).map(it => keys[it]);

  localDexscanKeys.forEach((localCobKey) => {
    const hasMatch = dexscanKeys.some(key => key === localCobKey);
    if (!hasMatch) {
      localStorage.removeItem(localCobKey);
    }
  });
};
