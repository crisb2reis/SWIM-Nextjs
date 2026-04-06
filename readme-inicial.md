# Swim-Nextjs e ServiceRegistroSWIMBR: Guia de Inicialização

Este documento contém o passo a passo para configurar e subir os ambientes de **Frontend (Next.js)**, **Backend (FastAPI)** e a estrutura de **Banco de Dados (Docker)** do projeto localmente.

## Visão Geral
O projeto está dividido nestes diretórios chave:
- **Frontend** (`AppRegistroSWIMBR`): Aplicação em Next.js (React) abordando as telas geradas.
- **Backend** (`ServiceRegistroSWIMBR`): Aplicação em FastAPI contendo microsserviços/scripts operacionais e as regras de negócio em API REST.
- **Banco de Dados**: O arquivo `docker-compose.yml` provê acesso a uma instância de PostgreSQL em conjunto com o gerenciador pgAdmin.

---

## 📥 Clonando o Repositório

Como primeiro passo, obtenha o código fonte na sua máquina local utilizando o Git:

```bash
git clone git@172.18.31.35:projetoregistroswimbr/Swim-Nextjs.git
cd Swim-Nextjs
```

---

## 🐋 1. Banco de Dados com Docker

Antes de rodar o Backend, é necessário iniciar os containers do banco de dados (PostgreSQL) e do painel de administração (pgAdmin). Estes containers estão declarados em `/ServiceRegistroSWIMBR/docker-compose.yml`.

### Passo a passo para Windows (Docker Desktop)
1. Certifique-se de que o aplicativo **Docker Desktop** está instalado e em plena execução na sua máquina.
2. Abra o terminal (PowerShell ou Prompt de Comando) e navegue até a pasta do backend:
   ```powershell
   cd ServiceRegistroSWIMBR
   ```
3. Suba os containers atrelados ao projeto em segundo plano (background):
   ```powershell
   docker compose up -d
   ```
   *(Nota: Se estiver usando versões mais antigas do docker-compose ou do Windows, utilize o comando `docker-compose up -d`)*.

### Passo a passo para Linux
1. Certifique-se de que você possui o **Docker engine** e o **Docker Compose** instalados (e o serviço rodando via systemd).
2. Abra o terminal e navegue para a subpasta do backend:
   ```bash
   cd ServiceRegistroSWIMBR
   ```
3. Suba os containers. Dependendo de como o seu controle de privilégios de usuário (Docker daemon) está configurado, você pode precisar utilizar o super-usuário (`sudo`):
   ```bash
   docker compose up -d
   # ou
   sudo docker compose up -d
   ```

> **Acesso Local aos Serviços Docker Provisionados:**
> - Banco de Dados (`swim_postgres`): Porta de acesso host `5434`
> - Administração do Banco (`swim_pgadmin`): Acesso web via [http://localhost:5050](http://localhost:5050)
>   - **Login**: `admin@swim.local`
>   - **Senha**: `admin`

### 🦫 Conexão Alternativa com DBeaver

Caso prefira utilizar o **DBeaver** para inspecionar e gerenciar o banco de dados diretamente, siga estas instruções:
1. Abra o DBeaver e crie uma **Nova Conexão**.
2. Selecione o driver **PostgreSQL**.
3. Preencha as credenciais com os seguintes dados:
   - **Host**: `localhost` (ou `127.0.0.1`)
   - **Port**: `5434`
   - **Database**: `swim_db`
   - **Username**: `swim_user`
   - **Password**: `swim_password`
4. Clique em **Test Connection** para confirmar que o banco está rodando e acessível e então em **Finish**.

---

## ⚙️ 2. Subindo o Backend (FastAPI)

Considerando o banco de dados já funcional, instancie o servidor web backend que irá expor a API principal.

1. **Abra um terminal exclusivo** (ou o atual) já na pasta do backend:
   ```bash
   cd ServiceRegistroSWIMBR
   ```

2. **Crie e ative o ambiente virtual Pyhon (`venv`):**
   * **No Windows:**
     ```powershell
     python -m venv .venv
     .venv\Scripts\activate
     ```
   * **No Linux / macOS:**
     ```bash
     python3 -m venv .venv
     source .venv/bin/activate
     ```

3. **Crie o arquivo de configuração de banco de dados e ambiente:**
   Gere o arquivo ` .env` a partir do template de amostra no mesmo diretório base:
   * **Windows:** `copy .env.example .env`
   * **Linux/macOS:** `cp .env.example .env`
   *(Confirme de que a string de conexão com o PostgreSQL esteja apontada devidamente para localhost:5434 com os valores dispostos no docker-compose)*.

4. **Instale as dependências Python requeridas:**
   ```bash
   pip install -r requirements.txt
   ```

5. **Inicie o servidor de desenvolvimento (Uvicorn):**
   ```bash
   uvicorn main:app --reload
   ```
   *O backend se encarregará de mostrar estar acessível em: [http://127.0.0.1:8000](http://127.0.0.1:8000).*
   *Você pode também visualizar nativamente a documentação interativa da API (Interface UI baseada em Swagger) acessando de modo prático do navegador: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).*

6. **Criar o Usuário Administrativo Inicial (Seed):**
   Com o ambiente virtual ativado e na pasta do backend, execute o script de semente para popular o banco com o usuário administrador:
   ```bash
   python scripts/seed.py
   ```
   **Credenciais Padrão Geradas:**
   - **Username/Email**: `admin@swim.com`
   - **Senha**: `admin1234`
   *(Lembre-se de alterar essa senha após o primeiro acesso).*

---

## 🎨 3. Subindo o Frontend (Next.js)

1. Em um **novo terminal limpo**, navegue de volta a pasta root do projeto e depois subdirecione até o ambiente web UI (frontend):
   ```bash
   cd AppRegistroSWIMBR
   ```

2. **Configure as variáveis de ambiente base:**
   Valide se as customizações vitais no arquivo ambiente apontam pra rota interna. Certifique-se de configurar e usar caso não exista algo como o arquivo `.env.local` conectando com a API, contendo ao menos:
   ```properties
   NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
   ```
   *(Este link deve ser rigorosamente a URL base gerada pelo Uvicorn/FastAPI do serviço anterior).*

3. **Restabeleça e instale as dependências e pacotes Node.js/npm:**
   ```bash
   npm install
   ```

4. **Traga à vida o servidor web em nível DevMode:**
   ```bash
   npm run dev
   ```

5. **Visão da interface:**
   O ambiente estático rodará perfeitamente acessível no caminho: [http://localhost:3000](http://localhost:3000). Abra esse link no seu web browser preferido para experimentar a solução integral.
