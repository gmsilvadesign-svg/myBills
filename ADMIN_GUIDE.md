# 🔧 Guia do Painel de Administração

## Visão Geral

O painel de administração foi criado para facilitar o gerenciamento e manutenção da aplicação de controle de contas. Ele oferece ferramentas para diagnosticar problemas, verificar o status do Firebase e resetar dados quando necessário.

## Como Acessar

1. Na aplicação, procure pelo botão **🔧** (ícone de ferramenta) no cabeçalho
2. Clique no botão para abrir o painel de administração
3. O painel abrirá em um modal com várias opções

## Funcionalidades Disponíveis

### 🔍 Diagnósticos

#### Verificar Saúde do Firebase
- **O que faz**: Testa a conectividade com o Firebase e verifica se as configurações estão corretas
- **Quando usar**: Quando suspeitar de problemas de conexão ou configuração
- **Resultado**: Mostra se o Firebase está funcionando corretamente e exibe detalhes no console

#### Verificar Status
- **O que faz**: Conta quantos documentos existem em cada coleção do Firebase
- **Quando usar**: Para verificar o estado atual dos dados
- **Resultado**: Mostra estatísticas dos dados no console

### 🗑️ Reset Completo

#### ⚠️ ATENÇÃO - Operação Destrutiva

- **O que faz**: Remove TODOS os dados do Firebase (todas as contas cadastradas)
- **Quando usar**: 
  - Para limpar dados de teste
  - Para começar do zero
  - Para resolver problemas de corrupção de dados
- **Segurança**: Requer dupla confirmação antes de executar
- **Resultado**: Todos os dados são permanentemente removidos

## Instruções de Uso

### Para Verificar a Saúde do Sistema

1. Abra o painel de administração
2. Clique em **"🔍 Verificar Saúde"**
3. Aguarde o processo terminar
4. Verifique o console do navegador (F12) para detalhes
5. Uma notificação aparecerá informando o resultado

### Para Verificar o Status dos Dados

1. Abra o painel de administração
2. Clique em **"📊 Verificar Status"**
3. Verifique o console do navegador para ver:
   - Quantas contas existem
   - Exemplos dos primeiros documentos

### Para Resetar o Firebase

1. **IMPORTANTE**: Faça backup dos dados importantes antes de continuar
2. Abra o painel de administração
3. Clique em **"🗑️ Reset Firebase"**
4. Confirme a primeira mensagem de aviso
5. Confirme a segunda mensagem de aviso (última chance)
6. Aguarde o processo terminar
7. Uma notificação confirmará se o reset foi bem-sucedido

## Solução de Problemas

### Erro de Permissão
- **Sintoma**: Mensagem "permission-denied"
- **Solução**: Verifique as regras do Firestore no console do Firebase

### Erro de Conectividade
- **Sintoma**: Mensagem "unavailable"
- **Solução**: Verifique sua conexão com a internet

### Projeto Não Encontrado
- **Sintoma**: Mensagem "not-found"
- **Solução**: Verifique as configurações do Firebase no arquivo `.env`

### Variáveis de Ambiente
- **Sintoma**: Erro de configuração
- **Solução**: 
  1. Copie `.env.example` para `.env`
  2. Configure todas as variáveis com os valores corretos do seu projeto Firebase

## Arquivos Relacionados

- `src/components/UI/modals/AdminPanel.tsx` - Interface do painel
- `src/utils/resetFirebase.ts` - Funções de reset e status
- `src/utils/firebaseHealth.ts` - Funções de diagnóstico
- `src/utils/testFirebase.ts` - Scripts de teste

## Segurança

- O painel só deve ser usado por administradores
- Sempre faça backup antes de resetar dados
- As operações de reset são irreversíveis
- Mantenha as credenciais do Firebase seguras

## Logs e Debugging

Todas as operações geram logs detalhados no console do navegador. Para visualizar:

1. Pressione F12 para abrir as ferramentas de desenvolvedor
2. Vá para a aba "Console"
3. Execute as operações do painel
4. Observe as mensagens de log para diagnóstico

---

**Nota**: Este painel foi criado para facilitar a manutenção da aplicação. Use com cuidado e sempre mantenha backups dos dados importantes.