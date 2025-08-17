import { useState, useEffect } from "react";

// ========================== Persistência das contas ==========================

const LS_KEY = "bills";

export function useLocalBills() {
  const [bills, setBills] = useState([]); // estado das contas

  // Carrega as contas do localStorage ao inicializar o hook
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) setBills(JSON.parse(raw)); // converte JSON para array
    } catch {}
  }, []);

  // Salva automaticamente as contas no localStorage sempre que o estado muda
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(bills));
    } catch {}
  }, [bills]);

  // Retorna estado das contas e função para atualizar
  return [bills, setBills];
}