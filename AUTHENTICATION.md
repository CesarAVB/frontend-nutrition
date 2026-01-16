# Sistema de Autenticação

## 📋 Visão Geral

Sistema completo de autenticação com login, proteção de rotas e gerenciamento de tokens JWT.

## 🔑 Componentes Criados

### 1. **AuthService** (`src/app/services/auth.ts`)
Serviço responsável pela autenticação e gerenciamento de sessão.

**Funcionalidades:**
- Login com email e senha
- Armazenamento seguro de token JWT no localStorage
- Gerenciamento de estado de autenticação com signals
- Logout com limpeza de dados

**Métodos principais:**
- `login(credentials)` - Realiza login na API
- `logout()` - Encerra sessão e redireciona para login
- `getToken()` - Retorna o token JWT armazenado
- `isAuthenticated()` - Signal que indica se usuário está autenticado
- `currentUser()` - Signal com dados do usuário atual

### 2. **LoginComponent** (`src/app/pages/login/`)
Página de login com formulário reativo.

**Características:**
- Formulário reativo com validações
- Feedback visual de erros
- Indicador de carregamento
- Design responsivo e moderno
- Integração com ToastService para notificações

### 3. **AuthGuard** (`src/app/guards/auth.guard.ts`)
Guard funcional para proteção de rotas.

**Comportamento:**
- Bloqueia acesso a rotas protegidas para usuários não autenticados
- Redireciona para página de login preservando URL de origem
- Usa signals para verificação de autenticação

### 4. **AuthInterceptor** (`src/app/interceptors/auth.interceptor.ts`)
Interceptor HTTP funcional que adiciona token JWT nas requisições.

**Funcionalidades:**
- Adiciona automaticamente header `Authorization: Bearer {token}`
- Ignora requisições de login (não adiciona token)
- Funciona com todas as requisições HTTP

## 🚀 Configuração

### Rotas Protegidas
Todas as rotas principais foram protegidas com `authGuard`:
- `/dashboard` - Dashboard principal
- `/pacientes/**` - Todas as rotas de pacientes
- `/consultas/**` - Todas as rotas de consultas

### Rota Pública
- `/login` - Página de login (acesso público)

## 🔧 API de Login

**Endpoint:** `https://api-login.cesaravb.com.br/login`

**Formato da Requisição:**
```json
{
  "email": "usuario@example.com",
  "password": "senha123"
}
```

**Formato da Resposta:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "123",
    "email": "usuario@example.com",
    "name": "Nome do Usuário"
  }
}
```

## 💡 Uso

### Login
1. Acesse `/login`
2. Digite email e senha
3. Clique em "Entrar"
4. Após sucesso, será redirecionado para o dashboard

### Logout
- Clique no botão de logout na navbar
- Sessão será encerrada e redirecionado para login

### Fluxo de Autenticação
1. Usuário faz login
2. Token JWT é armazenado no localStorage
3. Token é adicionado automaticamente em todas as requisições HTTP
4. Guards protegem rotas sensíveis
5. Ao fazer logout, token é removido

## 🛡️ Segurança

- Token armazenado de forma segura no localStorage
- Validação de formulários no frontend
- Guards impedem acesso não autorizado
- Interceptor adiciona token automaticamente
- Limpeza completa de dados no logout

## 📱 Interface

Design moderno com:
- Gradiente roxo atrativo
- Animações suaves
- Feedback visual de erros
- Indicador de carregamento
- Totalmente responsivo

## 🔄 Próximos Passos Recomendados

1. **Refresh Token**: Implementar renovação automática de token
2. **Remember Me**: Opção de lembrar credenciais
3. **Recuperação de Senha**: Fluxo de reset de senha
4. **Verificação 2FA**: Autenticação de dois fatores
5. **Session Timeout**: Logout automático após inatividade
