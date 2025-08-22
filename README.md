# Gerenciador de Contas Pessoais

Aplicação web desenvolvida em React para gerenciamento de contas a pagar, com visualização em lista ou calendário, filtros, exportação de eventos em .ics e configurações personalizáveis.

## Tecnologias

- React
- TypeScript
- Firebase/Firestore
- Tailwind CSS
- Vite

## Configuração do Projeto

### Pré-requisitos

- Node.js (versão recomendada: 18+)
- npm ou yarn

### Instalação

1. Clone o repositório
2. Instale as dependências:
   ```bash
   npm install
   ```

### Configuração das Variáveis de Ambiente

1. Crie um arquivo `.env` na raiz do projeto baseado no arquivo `.env.example`
2. Preencha as variáveis com suas credenciais do Firebase:
   ```
   VITE_FIREBASE_API_KEY=seu_api_key
   VITE_FIREBASE_AUTH_DOMAIN=seu_auth_domain
   VITE_FIREBASE_PROJECT_ID=seu_project_id
   VITE_FIREBASE_STORAGE_BUCKET=seu_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=seu_messaging_sender_id
   VITE_FIREBASE_APP_ID=seu_app_id
   VITE_FIREBASE_MEASUREMENT_ID=seu_measurement_id
   ```

### Executando o Projeto

```bash
npm run dev
```

O aplicativo estará disponível em `http://localhost:5173`

### Build para Produção

```bash
npm run build
```

## Funcionalidades

- Gerenciamento de contas a pagar
- Suporte a contas recorrentes (semanal, mensal, anual)
- Filtros por data e status
- Visualização em lista e calendário
- Exportação para formato ICS (calendário)
- Suporte a temas claro/escuro
- Internacionalização (PT, EN, ES)