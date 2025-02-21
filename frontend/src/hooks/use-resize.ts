import { useEffect } from 'react';
import { domEvent } from './dom-event';

export function useResize(onResize?: () => void, immediate = true) {
  useEffect(() => {
    if (immediate) {
      onResize?.();
    }
    return domEvent(window, 'resize', () => {
      onResize?.();
    });
  }, [immediate, onResize]);
}
