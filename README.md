# AS Auto Dreams — Consultoria + Intermediação Automotiva

Plataforma oficial da **AS Auto Dreams Consultoria + Intermediação** para divulgação de veículos, captação de clientes interessados (com conformidade LGPD), integração direta com WhatsApp e painel administrativo exclusivo.

- **Direção Executiva:** Anderson Santana — CEO e Proprietário
- **WhatsApp Oficial:** (92) 98627-8729 (`https://wa.me/559286278729`)
- **Instagram:** [@as.autodreams](https://www.instagram.com/as.autodreams)
- **Facebook:** [AS Auto Dreams](https://www.facebook.com/share/1DkRTjXg5s/)

---

## Stack Tecnológica

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, React Router DOM, Lucide React
- **Banco de Dados, Autenticação e Storage:** Supabase (PostgreSQL + RLS + Supabase Auth + Supabase Storage)
- **Hospedagem Recomendada:** Vercel + GitHub (`andercapo0908-ship-it/as-auto-dreams`)

---

## Estrutura Principal

- `public/images/logo-as-auto-dreams.png` — Logomarca oficial preservada
- `supabase/migrations/001_initial_schema.sql` — Criação das tabelas `vehicles`, `leads`, índices, triggers, políticas RLS e bucket `vehicle-photos`
- `src/lib/supabase.ts` — Cliente Supabase inicializado via variáveis de ambiente (`VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`)
- `src/services/` — Serviços para veículos, upload de fotografias, interessados e autenticação administrativa
- `src/pages/` — Página Inicial, Catálogo com filtros completos, Página Individual do Veículo, Consultoria, Login Admin e Painel Administrativo
- `vercel.json` — Rewrites SPA para publicação direta na Vercel

---

## Etapa 1 — Instalação e Execução Local

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Copie `.env.example` para `.env`:
   ```bash
   cp .env.example .env
   ```
3. Preencha `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` no arquivo `.env` (ou utilize o modo de pré-visualização local enquanto não conecta o Supabase).
4. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
5. Para validar tipos e gerar o build de produção:
   ```bash
   npm run lint
   npm run build
   ```

> **Nota sobre pré-visualização local sem Supabase:** Caso `VITE_SUPABASE_URL` ainda não esteja configurada, o servidor Express de desenvolvimento (`server.ts`) persiste veículos, fotos e interessados localmente no servidor em `data/store.json` (ignorado no Git). O acesso administrativo de pré-visualização utiliza `PREVIEW_ADMIN_EMAIL` (padrão `admin@asautodreams.com.br`) e `PREVIEW_ADMIN_PASSWORD` configurados no `.env` do servidor.

---

## Etapa 2 — Envio para o GitHub

Repositório alvo: `andercapo0908-ship-it/as-auto-dreams`

1. Confirme que arquivos `.env`, `data/` e `public/uploads/` estão ignorados pelo `.gitignore`.
2. Inicialize ou conecte o repositório remoto e envie os arquivos:
   ```bash
   git init
   git add .
   git commit -m "feat: plataforma oficial AS Auto Dreams"
   git branch -M main
   git remote add origin https://github.com/andercapo0908-ship-it/as-auto-dreams.git
   git push -u origin main
   ```

---

## Etapa 3 — Configuração do Supabase e Deploy na Vercel

### 3.1. Configurar o Supabase

1. Crie um projeto no [Supabase](https://supabase.com/).
2. No menu **SQL Editor**, abra o arquivo `supabase/migrations/001_initial_schema.sql`, cole todo o conteúdo e clique em **Run**.
   - Isso criará as tabelas `public.vehicles` e `public.leads`, todos os índices, as políticas de segurança **RLS** e o bucket público `vehicle-photos` no **Storage**.
3. No menu **Authentication → Users**, clique em **Add user → Create new user** e cadastre o e-mail e a senha do administrador autorizado (ex: Anderson Santana).
   - O painel `/admin` aceita login apenas de usuários autenticados no Supabase Auth.
4. No menu **Settings → API**, copie:
   - **Project URL** (`VITE_SUPABASE_URL`)
   - **anon public key** (`VITE_SUPABASE_ANON_KEY`)
   - **Nunca** exponha a `service_role` key no código do navegador.

### 3.2. Deploy na Vercel

1. Acesse a [Vercel](https://vercel.com/) e importe o repositório `andercapo0908-ship-it/as-auto-dreams`.
2. Configurações de Build:
   - **Framework Preset:** `Vite`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. Em **Environment Variables**, adicione:
   - `VITE_SUPABASE_URL` = URL do seu projeto Supabase
   - `VITE_SUPABASE_ANON_KEY` = Chave `anon public` do seu projeto Supabase
4. Clique em **Deploy**. O arquivo `vercel.json` já garante o roteamento correto das rotas `/catalogo`, `/veiculo/:id`, `/consultoria` e `/admin`.

---

## Checklist Pós-Deploy

- [ ] Abrir a página inicial e verificar a exibição da logomarca original
- [ ] Acessar `/admin/login` e autenticar com o usuário criado no Supabase Auth
- [ ] Cadastrar um veículo real com fotografias (verificando upload no bucket `vehicle-photos`)
- [ ] Testar filtros por marca, modelo, ano, câmbio, combustível e preço em `/catalogo`
- [ ] Abrir a página individual `/veiculo/:id` e testar os botões **TENHO INTERESSE** e **FALAR PELO WHATSAPP**
- [ ] Enviar formulário de interesse e confirmar gravação na tabela `leads` e visualização no painel `/admin`
- [ ] Testar navegação completa e painel administrativo em smartphone Android
