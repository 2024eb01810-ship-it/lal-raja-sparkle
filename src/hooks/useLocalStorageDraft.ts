import { useEffect, useRef, useCallback } from "react";

/**
 * useLocalStorageDraft — persists form state to localStorage automatically.
 *
 * Usage:
 *   const { hasDraft, clearDraft } = useLocalStorageDraft(FORM_KEY, form, setForm, defaultForm);
 *
 * @param key        localStorage key
 * @param state      current form state object
 * @param setState   state setter (React dispatch or equivalent)
 * @param defaults   the default/empty form values (used to reset on clearDraft)
 * @param omitKeys   keys to never persist (e.g. passwords, file blobs)
 */
export function useLocalStorageDraft<T extends Record<string, unknown>>(
  key: string,
  state: T,
  setState: React.Dispatch<React.SetStateAction<T>>,
  defaults: T,
  omitKeys: (keyof T)[] = []
) {
  const hasMounted = useRef(false);

  // Restore draft on mount (once only)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<T>;
        setState(prev => ({ ...prev, ...saved }));
      }
    } catch {
      // ignore corrupt data
    }
    hasMounted.current = true;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // Save to localStorage whenever state changes (after mount)
  useEffect(() => {
    if (!hasMounted.current) return;
    try {
      const toSave = { ...state };
      for (const k of omitKeys) delete toSave[k];
      localStorage.setItem(key, JSON.stringify(toSave));
    } catch {
      // ignore quota errors etc.
    }
  }, [key, state, omitKeys]);

  // Clear draft and reset form to defaults
  const clearDraft = useCallback(() => {
    localStorage.removeItem(key);
    setState(defaults);
  }, [key, setState, defaults]);

  // Whether a draft currently exists in storage
  const hasDraft = (() => {
    try {
      return !!localStorage.getItem(key);
    } catch {
      return false;
    }
  })();

  return { hasDraft, clearDraft };
}
