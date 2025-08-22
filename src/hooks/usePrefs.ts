import { useState, useEffect, Dispatch, SetStateAction } from "react";
import * as Types from "../types";

export function usePrefs(): [Types.UserPreferences, Dispatch<SetStateAction<Types.UserPreferences>>] {
  const [prefs, setPrefs] = useState<Types.UserPreferences>(() => {
    const raw = localStorage.getItem("prefs");
    if (raw) return JSON.parse(raw) as Types.UserPreferences;
    return { theme: "system", language: "pt", currency: "BRL" } as Types.UserPreferences;
  });

  // Salvar no localStorage
  useEffect(() => {
    localStorage.setItem("prefs", JSON.stringify(prefs));
  }, [prefs]);

  // Aplicar tema
  useEffect(() => {
    const body = document.body;
    const applyTheme = () => {
      if (prefs.theme === "dark") {
        body.classList.add("dark");
      } else if (prefs.theme === "light") {
        body.classList.remove("dark");
      } else {
        // system
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        body.classList.toggle("dark", prefersDark);
      }
    };
    applyTheme();

    if (prefs.theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const listener = () => applyTheme();
      mq.addEventListener("change", listener);
      return () => mq.removeEventListener("change", listener);
    }
  }, [prefs.theme]);

  return [prefs, setPrefs];
}
