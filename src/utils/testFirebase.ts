import { checkFirebaseStatus } from './resetFirebase';

/**
 * Script de teste para as funções do Firebase
 * Execute este arquivo para testar as funcionalidades de reset
 */

async function testFirebaseFunctions() {
  console.log('🧪 Iniciando testes das funções do Firebase...');
  
  try {
    // Primeiro, verificar o status atual
    console.log('\n1️⃣ Verificando status atual do Firebase:');
    await checkFirebaseStatus();
    
    // Aguardar confirmação do usuário
    console.log('\n⚠️ ATENÇÃO: O próximo passo irá DELETAR todos os dados!');
    console.log('Para continuar com o reset, descomente a linha abaixo e execute novamente.');
    
    // Descomente a linha abaixo para executar o reset
    // await resetFirebaseData();
    
    // Verificar status após reset
    // console.log('\n2️⃣ Verificando status após reset:');
    // await checkFirebaseStatus();
    
    console.log('\n✅ Testes concluídos!');
    
  } catch (error) {
    console.error('❌ Erro durante os testes:', error);
  }
}

// Executar os testes se este arquivo for executado diretamente
if (typeof window === 'undefined') {
  testFirebaseFunctions();
}

export { testFirebaseFunctions };