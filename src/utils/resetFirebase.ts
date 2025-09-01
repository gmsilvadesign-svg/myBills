import { db, auth, isLocalMode } from '@/firebase';
import * as local from '@/utils/localDb';
import { collection, getDocs, deleteDoc, doc, query, where } from 'firebase/firestore';

/**
 * Limpa todos os dados do usuário autenticado (bills, incomes, purchases)
 */
export async function resetFirebaseData(): Promise<void> {
  try {
    console.log('Iniciando reset dos dados do usuário...');
    const uid = auth.currentUser?.uid || 'local-user';

    const colls = ['bills', 'incomes', 'purchases'] as const;
    let total = 0;
    if (isLocalMode) {
      for (const c of colls) {
        const before = local.list(c, uid); local.removeWhere(c, r => r.userId === uid); const after = local.list(c, uid); total += (before.length - after.length);
      }
    } else {
      for (const c of colls) {
        const snap = await getDocs(query(collection(db, c), where('userId', '==', uid)));
        total += snap.size;
        const deletes = snap.docs.map((d) => deleteDoc(doc(db, c, d.id)));
        await Promise.all(deletes);
      }
    }
    console.log(`OK. ${total} documentos removidos.`);
  } catch (error) {
    console.error('Erro ao resetar dados:', error);
    throw error;
  }
}

/**
 * Mostra no console quantos documentos existem por coleção para o usuário atual
 */
export async function checkFirebaseStatus(): Promise<void> {
  try {
    console.log('Verificando status por usuário...');
    const uid = auth.currentUser?.uid || 'local-user';
    const colls = ['bills', 'incomes', 'purchases'] as const;
    if (isLocalMode) {
      for (const c of colls) console.log(`Coleção '${c}': ${(local.list(c, uid) as any[]).length} documentos`);
    } else {
      for (const c of colls) {
        const snap = await getDocs(query(collection(db, c), where('userId', '==', uid)));
        console.log(`Coleção '${c}': ${snap.size} documentos`);
      }
    }
  } catch (error) {
    console.error('Erro ao verificar status do Firebase:', error);
    throw error;
  }
}
