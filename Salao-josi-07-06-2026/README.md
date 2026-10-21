# Salão Josi

Sistema de gerenciamento de salão, com interface web em React e API em Node.js/Express.

## Estrutura

- `web/`: aplicação frontend React.
- `ws/`: API backend e integração com MongoDB.
- `arquivo-do-drawio-com/`: diagrama do projeto.

## Requisitos

- Node.js e npm
- Uma instância MongoDB acessível pela API

## Configuração do backend

1. Entre na pasta `ws`.
2. Instale as dependências: `npm install`.
3. Copie `.env.example` para `.env`.
4. Preencha `MONGODB_URI` com a conexão do seu banco.
5. Configure `JWT_SECRET` com um valor aleatório forte. A API não inicia sem essa variável.
6. Configure `GMAIL_USER` e `GMAIL_APP_PASSWORD` se for usar recuperação de senha por e-mail.
7. Opcionalmente, defina `ADMIN_EMAIL` e `ADMIN_PASSWORD` para habilitar o acesso administrativo configurado por ambiente.
8. Inicie a API: `npm start`.

A API escuta na porta `8000`.

## Configuração do frontend

1. Entre na pasta `web`.
2. Instale as dependências: `npm install`.
3. Copie `.env.example` para `.env` se precisar alterar o endereço da API.
4. Inicie o frontend: `npm start`.
5. Para gerar a versão de produção: `npm run build`.

Por padrão, o frontend chama `http://localhost:8000`. Configure `REACT_APP_API_URL` para usar outro endereço.

## Antes de publicar no GitHub

- Não envie arquivos `.env`, senhas, tokens ou credenciais.
- Configure as variáveis de ambiente no ambiente de hospedagem.
- Não reutilize segredos de desenvolvimento; configure `JWT_SECRET` e, se necessário, as credenciais administrativas fora do repositório.
- Os arquivos enviados pelos usuários para `ws/public/uploads/` não são versionados.
- Dependências (`node_modules`) não são incluídas; instale-as com `npm install`.

## Observação importante sobre segurança

As credenciais do MongoDB que estavam no código original foram removidas e substituídas por `MONGODB_URI`. Como a senha antiga estava escrita diretamente no código, troque/rotacione essa senha no MongoDB Atlas antes de continuar usando o banco.
