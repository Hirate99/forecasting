/* eslint-disable @typescript-eslint/no-explicit-any */
type TFn<T = any> = (...args: any[]) => T;

export const throttle = <T extends TFn>(fn: T, timeout = 300) => {
  let prevRes: ReturnType<T>;
  let prev: number;

  return (...args: Parameters<T>) => {
    if (!prevRes || Date.now() - prev > timeout) {
      prevRes = fn(...args);
      prev = Date.now();
      return prevRes;
    }
    return prevRes;
  };
};

export const debounce = <T extends TFn>(fn: T, timeout = 300) => {
  let prev: number;

  return (...args: Parameters<T>) => {
    clearTimeout(prev);
    prev = setTimeout(() => {
      fn(...args);
    }, timeout) as unknown as number;
  };
};

type TEffectListenerRet = () => void;

export function combineListener(...listeners: TEffectListenerRet[]) {
  return () => {
    for (const ret of listeners) {
      ret();
    }
  };
}
