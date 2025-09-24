import { useState, useEffect, Dispatch, SetStateAction } from "react";
import * as Types from "@/types";

const PREFS_STORAGE_KEY = "prefs";

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
    return { theme: "system", language: "pt", currency: "BRL", hideValues: false };
  }
  const raw = window.localStorage.getItem(PREFS_STORAGE_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as Types.UserPreferences;
      return {
        theme: parsed.theme ?? "system",
        language: parsed.language ?? "pt",
        currency: parsed.currency ?? "BRL",
        hideValues: parsed.hideValues ?? false,
        goals: sanitizeGoals(parsed.goals),
      };
    } catch {
      // fall through to defaults
    }
  }
  return { theme: "system", language: "pt", currency: "BRL", hideValues: false } as Types.UserPreferences;
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

  // Apply theme to the document body
  useEffect(() => {
    const body = document.body;
    const applyTheme = () => {
      if (prefsState.theme === "dark") {
        body.classList.add("dark");
      } else if (prefsState.theme === "light") {
        body.classList.remove("dark");
      } else {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        body.classList.toggle("dark", prefersDark);
      }
    };
    applyTheme();

    if (prefsState.theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const listener = () => applyTheme();
      mq.addEventListener("change", listener);
      return () => mq.removeEventListener("change", listener);
    }
  }, [prefsState.theme]);

  return [prefsState, setPrefs];
}
