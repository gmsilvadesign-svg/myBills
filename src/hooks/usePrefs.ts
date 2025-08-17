import { useState, useEffect } from "react";
import { LS_PREFS } from "../constants/constants.ts";

// ========================= Preferências (Tema/Idioma) ========================

export function usePrefs() {
  // Estado das preferências, inicializado a partir do localStorage ou com valores padrão
  const [prefs, setPrefs] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_PREFS); // tenta recuperar do localStorage
      if (raw) return JSON.parse(raw); // se existir, converte JSON para objeto
    } catch {}
    // Valores padrão caso não exista nada no localStorage
    return { theme: "system", language: "pt", currency: "BRL" };
  });

  // Efeito para salvar automaticamente as preferências no localStorage sempre que mudarem
  useEffect(() => {
    try {
      localStorage.setItem(LS_PREFS, JSON.stringify(prefs));
    } catch {}
  }, [prefs]);

  // Efeito para aplicar o tema (claro/escuro) no <html> e <body>
  useEffect(() => {
    const root = document.documentElement; // <html>
    const body = document.body; // <body>
    const mq = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)'); // detecta preferência do sistema

    // Função que aplica o tema escuro ou claro
    const apply = () => {
      // Determina se o tema efetivo deve ser escuro
      const effectiveDark = prefs.theme === 'dark' || (prefs.theme === 'system' && mq && mq.matches);
      [root, body].forEach((el) => {
        if (!el) return;
        // Adiciona ou remove a classe 'dark' nos elementos
        el.classList.toggle('dark', !!effectiveDark);
      });
    };

    apply(); // aplica imediatamente

    // Se o tema for 'system', escuta alterações nas preferências do sistema
    if (prefs.theme === 'system' && mq) {
      if (mq.addEventListener) {
        mq.addEventListener('change', apply);
        return () => mq.removeEventListener('change', apply); // limpa o listener ao desmontar
      } else if (mq.addListener) { // suporte para navegadores antigos
        mq.addListener(apply);
        return () => mq.removeListener(apply);
      }
    }
  }, [prefs.theme]);

  // Retorna o estado das preferências e função para atualizar
  return [prefs, setPrefs];
}