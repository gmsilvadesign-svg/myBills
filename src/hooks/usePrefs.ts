import { useState, useEffect } from "react";
import { LS_PREFS } from "../constants/constants.ts";

// ========================= Preferências (Tema/Idioma) ========================

export function usePrefs() {
 // Estado das preferências, inicializado a partir do localStorage ou valores padrão
  const [prefs, setPrefs] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_PREFS);
      if (raw) return JSON.parse(raw);
      } catch (err) {
      console.error(err);
    }
    return { theme: "system", language: "pt", currency: "BRL" };
  });

  // Salva automaticamente no localStorage sempre que prefs mudar
  useEffect(() => {
    try {
      localStorage.setItem(LS_PREFS, JSON.stringify(prefs));
    } catch (err) {
      console.error(err);
    }
  }, [prefs]);

  // Aplica o tema dark/light no <html> de acordo com prefs.theme
  useEffect(() => {
    const root = document.documentElement;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");

    const applyTheme = () => {
      const isDark =
        prefs.theme === "dark" ||
        (prefs.theme === "system" && mq.matches);
      // Aplica ou remove a classe/atributo que habilita o tema escuro
      root.classList.toggle("dark", isDark);
      root.dataset.theme = isDark ? "dark" : "light";
      root.style.colorScheme = isDark ? "dark" : "light";
    };

    applyTheme(); // aplica imediatamente

    // Se o tema for 'system', escuta alterações nas preferências do sistema
    if (prefs.theme === "system") {
      const listener = () => applyTheme();
      if (mq.addEventListener) {
        mq.addEventListener("change", listener);
        return () => mq.removeEventListener("change", listener);
      } else if (mq.addListener) {
        mq.addListener(listener);
        return () => mq.removeListener(listener);
      }
    }
  }, [prefs.theme]);

  return [prefs, setPrefs];
}