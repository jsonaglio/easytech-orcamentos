# Easy Tech — Monte seu PC 🖥

Sistema de orçamento de computadores com catálogo persistido no Vercel KV.

## Stack
- **Frontend + Backend**: Next.js 14 (Pages Router)
- **Banco de dados**: Vercel KV (Redis)
- **Deploy**: Vercel via GitHub

---

## 🚀 Deploy em 5 minutos

### 1. GitHub
```bash
# No terminal, dentro da pasta do projeto:
git init
git add .
git commit -m "feat: Easy Tech v1"

# Crie um repositório no github.com e rode:
git remote add origin https://github.com/SEU_USUARIO/easytech-orcamentos.git
git push -u origin main
```

### 2. Vercel
1. Acesse [vercel.com](https://vercel.com) e faça login com o GitHub
2. Clique em **"Add New Project"** → selecione o repositório `easytech-orcamentos`
3. Clique em **Deploy** (as configurações são detectadas automaticamente)

### 3. Vercel KV (banco de dados)
1. No dashboard do projeto no Vercel, vá em **Storage**
2. Clique em **Create Database** → selecione **KV**
3. Dê um nome (ex: `easytech-kv`) e clique em **Create**
4. Na tela seguinte, clique em **Connect to Project** → selecione seu projeto
5. As variáveis de ambiente são injetadas automaticamente ✅

### 4. Redeploy
Após conectar o KV, vá em **Deployments** e clique em **Redeploy** no último deploy.

---

## 🛠 Rodar localmente

```bash
# Instalar dependências
npm install

# Puxar variáveis de ambiente do Vercel (precisa do CLI)
npm i -g vercel
vercel login
vercel link
vercel env pull .env.local

# Iniciar servidor de desenvolvimento
npm run dev
```

Acesse: http://localhost:3000

---

## 📡 API

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/produtos` | Lista todos os produtos |
| POST | `/api/produtos` | Cria ou atualiza produto |
| GET | `/api/produtos/:id` | Produto por ID |
| DELETE | `/api/produtos/:id` | Remove produto |
| POST | `/api/sync` | Sincroniza catálogo completo |

---

## 📁 Estrutura

```
easytech/
├── pages/
│   ├── index.js          ← Interface completa (builder + catálogo)
│   ├── _app.js
│   └── api/
│       ├── produtos/
│       │   ├── index.js  ← GET todos | POST upsert
│       │   └── [id].js   ← GET | DELETE por id
│       └── sync.js       ← POST sync em lote
├── lib/
│   └── kv.js             ← Wrapper do Vercel KV
├── public/
│   └── logo.png
├── styles/
│   └── globals.css
└── README.md
```
