import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "@/firebase";
import { ymd } from "@/utils/utils";

export async function addSampleBills() {
  const billsRef = collection(db, "bills");
  
  const sampleBills = [
    {
      title: "Conta de Luz",
      amount: 150.50,
      dueDate: ymd(new Date(2024, 11, 15)), // 15 de dezembro
      recurrence: "MONTHLY" as const,
      category: "Fixas",
      tags: ["energia", "essencial"],
      notes: "Conta da CEMIG",
      paid: false,
      paidOn: null
    },
    {
      title: "Internet",
      amount: 89.90,
      dueDate: ymd(new Date(2024, 11, 10)), // 10 de dezembro
      recurrence: "MONTHLY" as const,
      category: "Fixas",
      tags: ["internet", "essencial"],
      notes: "Plano 200MB",
      paid: true,
      paidOn: ymd(new Date(2024, 11, 8))
    },
    {
      title: "Supermercado",
      amount: 320.75,
      dueDate: ymd(new Date(2024, 11, 20)), // 20 de dezembro
      recurrence: "NONE" as const,
      category: "Variáveis",
      tags: ["alimentação"],
      notes: "Compras do mês",
      paid: false,
      paidOn: null
    },
    {
      title: "Plano de Saúde",
      amount: 450.00,
      dueDate: ymd(new Date(2024, 11, 5)), // 5 de dezembro
      recurrence: "MONTHLY" as const,
      category: "Fixas",
      tags: ["saúde", "essencial"],
      notes: "Unimed",
      paid: true,
      paidOn: ymd(new Date(2024, 11, 3))
    },
    {
      title: "Cartão de Crédito",
      amount: 1250.30,
      dueDate: ymd(new Date(2024, 11, 25)), // 25 de dezembro
      recurrence: "MONTHLY" as const,
      category: "Variáveis",
      tags: ["cartão"],
      notes: "Fatura Nubank",
      paid: false,
      paidOn: null
    }
  ];

  try {
    for (const bill of sampleBills) {
      const uid = auth.currentUser?.uid || 'dev';
      await addDoc(billsRef, { ...bill, userId: uid, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
      console.log(`Conta adicionada: ${bill.title}`);
    }
    console.log("Todas as contas de exemplo foram adicionadas com sucesso!");
  } catch (error) {
    console.error("Erro ao adicionar contas de exemplo:", error);
  }
}

// Função para ser chamada no console do navegador
(window as any).addSampleBills = addSampleBills;
