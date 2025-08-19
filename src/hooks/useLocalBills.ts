import { useState, useEffect } from "react";

// ========================== Persistência das contas ==========================

// Chave usada no localStorage
const LS_KEY = "bills";

export function useLocalBills() {
  // Estado local para armazenar as contas
  const [bills, setBills] = useState([]);

  // Carrega as contas do localStorage ao montar o hook
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) setBills(JSON.parse(raw)); // converte JSON para array
    } catch (err) {
      console.error(err);
    }
  }, []);

  // Salva automaticamente as contas no localStorage sempre que o estado mudar
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(bills));
      } catch (err) {
      console.error(err);
    }
  }, [bills]);

  // Retorna o estado das contas e função para atualizar
  return [bills, setBills];
}
