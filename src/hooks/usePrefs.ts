import { useState, useEffect, Dispatch, SetStateAction } from "react";
import * as Types from "@/types";

const PREFS_STORAGE_KEY = "prefs";

const DEFAULT_PREFS: Types.UserPreferences = {
  language: "pt",
  currency: "BRL",
  hideValues: false,
};

const loadInitialPrefs = (): Types.UserPreferences => {
  if (typeof window === "undefined") {
    return { ...DEFAULT_PREFS };
  }
  const raw = window.localStorage.getItem(PREFS_STORAGE_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as Types.UserPreferences;
      return {
        language: parsed.language ?? DEFAULT_PREFS.language,
        currency: parsed.currency ?? DEFAULT_PREFS.currency,
        hideValues: parsed.hideValues ?? DEFAULT_PREFS.hideValues,
      };
    } catch {
      // fall through to defaults
    }
  }
  return { ...DEFAULT_PREFS };
};

export function usePrefs(): [Types.UserPreferences, Dispatch<SetStateAction<Types.UserPreferences>>] {
  const [prefsState, setPrefsState] = useState<Types.UserPreferences>(() => loadInitialPrefs());

  const setPrefs: Dispatch<SetStateAction<Types.UserPreferences>> = (update) => {
    setPrefsState((prev) => (typeof update === "function" ? (update as (prev: Types.UserPreferences) => Types.UserPreferences)(prev) : update));
  };

  useEffect(() => {
    window.localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(prefsState));
  }, [prefsState]);

  return [prefsState, setPrefs];
}
