import { useMemo } from 'react';
import { validateURLParams, type ValidatedParams } from '../utils/validation';

export function useURLParams(): ValidatedParams | { error: string } {
  return useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return validateURLParams(params);
  }, []);
}
