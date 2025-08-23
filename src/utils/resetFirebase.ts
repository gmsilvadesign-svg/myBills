import { db } from '@/firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

/**
 * Função para resetar/limpar todos os dados do Firebase
 * Remove todas as contas (bills) da coleção
 */
export async function resetFirebaseData(): Promise<void> {
  try {
    console.log('🔄 Iniciando reset do Firebase...');
    
    // Limpar coleção de bills
    const billsCollection = collection(db, 'bills');
    const billsSnapshot = await getDocs(billsCollection);
    
    const deletePromises = billsSnapshot.docs.map(billDoc => 
      deleteDoc(doc(db, 'bills', billDoc.id))
    );
    
    await Promise.all(deletePromises);
    
    console.log(`✅ ${billsSnapshot.docs.length} documentos removidos da coleção 'bills'`);
    console.log('🎉 Reset do Firebase concluído com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao resetar Firebase:', error);
    throw error;
  }
}

/**
 * Função para verificar o status atual do Firebase
 * Mostra quantos documentos existem em cada coleção
 */
export async function checkFirebaseStatus(): Promise<void> {
  try {
    console.log('📊 Verificando status do Firebase...');
    
    // Verificar coleção de bills
    const billsCollection = collection(db, 'bills');
    const billsSnapshot = await getDocs(billsCollection);
    
    console.log(`📋 Coleção 'bills': ${billsSnapshot.docs.length} documentos`);
    
    if (billsSnapshot.docs.length > 0) {
      console.log('📄 Primeiros 3 documentos:');
      billsSnapshot.docs.slice(0, 3).forEach((doc, index) => {
        console.log(`  ${index + 1}. ID: ${doc.id}`, doc.data());
      });
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar status do Firebase:', error);
    throw error;
  }
}