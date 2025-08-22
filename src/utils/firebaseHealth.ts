import { db } from '../firebase';
import { collection, doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';

/**
 * Função para verificar a saúde da conexão com o Firebase
 * Testa operações básicas de CRUD
 */
export async function checkFirebaseHealth(): Promise<boolean> {
  try {
    console.log('🔍 Verificando conectividade com Firebase...');
    
    const testDocId = 'health-check-' + Date.now();
    const testCollection = collection(db, 'health-test');
    const testDocRef = doc(testCollection, testDocId);
    
    // Teste 1: Criar documento
    console.log('📝 Testando criação de documento...');
    await setDoc(testDocRef, {
      timestamp: new Date().toISOString(),
      test: 'health-check',
      status: 'testing'
    });
    console.log('✅ Documento criado com sucesso');
    
    // Teste 2: Ler documento
    console.log('📖 Testando leitura de documento...');
    const docSnap = await getDoc(testDocRef);
    if (docSnap.exists()) {
      console.log('✅ Documento lido com sucesso:', docSnap.data());
    } else {
      throw new Error('Documento não encontrado após criação');
    }
    
    // Teste 3: Deletar documento
    console.log('🗑️ Testando exclusão de documento...');
    await deleteDoc(testDocRef);
    console.log('✅ Documento deletado com sucesso');
    
    // Verificar se foi realmente deletado
    const deletedDocSnap = await getDoc(testDocRef);
    if (!deletedDocSnap.exists()) {
      console.log('✅ Confirmado: documento foi removido');
    } else {
      throw new Error('Documento ainda existe após exclusão');
    }
    
    console.log('🎉 Todos os testes de conectividade passaram!');
    return true;
    
  } catch (error) {
    console.error('❌ Erro na verificação de saúde do Firebase:', error);
    
    // Diagnóstico adicional
    if (error instanceof Error) {
      if (error.message.includes('permission-denied')) {
        console.error('🚫 Erro de permissão: Verifique as regras do Firestore');
      } else if (error.message.includes('unavailable')) {
        console.error('🌐 Erro de conectividade: Verifique sua conexão com a internet');
      } else if (error.message.includes('not-found')) {
        console.error('🔍 Projeto não encontrado: Verifique as configurações do Firebase');
      }
    }
    
    return false;
  }
}

/**
 * Função para verificar as configurações do Firebase
 */
export function checkFirebaseConfig(): void {
  console.log('⚙️ Verificando configurações do Firebase...');
  
  const requiredEnvVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID'
  ];
  
  const missingVars: string[] = [];
  
  requiredEnvVars.forEach(varName => {
    const value = import.meta.env[varName];
    if (!value || value === 'your_' + varName.toLowerCase().replace('vite_firebase_', '')) {
      missingVars.push(varName);
    } else {
      console.log(`✅ ${varName}: Configurado`);
    }
  });
  
  if (missingVars.length > 0) {
    console.error('❌ Variáveis de ambiente não configuradas:');
    missingVars.forEach(varName => {
      console.error(`   - ${varName}`);
    });
    console.error('\n💡 Dica: Copie .env.example para .env e configure as variáveis');
  } else {
    console.log('✅ Todas as variáveis de ambiente estão configuradas');
  }
}