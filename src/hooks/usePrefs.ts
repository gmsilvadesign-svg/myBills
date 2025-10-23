import { useState, useEffect, Dispatch, SetStateAction } from "react";
import * as Types from "@/types";

const PREFS_STORAGE_KEY = "prefs";

const DEFAULT_PREFS: Types.UserPreferences = {
  language: "pt",
  currency: "BRL",
  hideValues: false,
};

const toNumber = (value: unknown): number | undefined => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
};

const sanitizeGoals = (goals?: Types.UserGoals | null): Types.UserGoals | undefined => {
  if (!goals) return undefined;
  const normalized: Types.UserGoals = {
    incomeTarget: toNumber(goals.incomeTarget ?? undefined) ?? undefined,
    savingsTarget: toNumber(goals.savingsTarget ?? undefined) ?? undefined,
    expensesLimit: toNumber(goals.expensesLimit ?? undefined) ?? undefined,
    purchasesLimit: toNumber(goals.purchasesLimit ?? undefined) ?? undefined,
  };
  const entries = Object.entries(normalized).filter(([, value]) => typeof value === "number" && Number.isFinite(value));
  if (!entries.length) return undefined;
  return entries.reduce<Types.UserGoals>((acc, [key, value]) => {
    (acc as any)[key] = value;
    return acc;
  }, {} as Types.UserGoals);
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
        goals: sanitizeGoals(parsed.goals),
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
    setPrefsState((prev) => {
      const next = typeof update === "function" ? (update as (prev: Types.UserPreferences) => Types.UserPreferences)(prev) : update;
      return {
        ...next,
        goals: sanitizeGoals(next.goals),
      };
    });
  };

  // Persist preferences whenever they change
  useEffect(() => {
    const payload: Types.UserPreferences = {
      ...prefsState,
      goals: sanitizeGoals(prefsState.goals),
    };
    if (!payload.goals) {
      delete (payload as any).goals;
    }
    window.localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(payload));
  }, [prefsState]);

  return [prefsState, setPrefs];
}
