# CarePlus+

Aplicação web de **saúde gamificada** desenvolvida em **React + Vite** para o Challenge FIAP (Care Plus). O CarePlus+ transforma hábitos saudáveis em uma jornada: missões diárias (passos, água e sono), pontos, streak, badges, uma linha do tempo mensal (*The Chronicle*) e uma rede social de incentivo (*Health Chains*). O visual reage à saúde do usuário através do sistema **Vitals Weather**.

---

## Tecnologias

- [React 18](https://react.dev/) + [Vite](https://vitejs.dev/)
- [React Router v6](https://reactrouter.com/) — navegação por rotas
- [Tailwind CSS](https://tailwindcss.com/) — estilização por classes utilitárias
- [Framer Motion](https://www.framer.com/motion/) — animações e microinterações
- [lucide-react](https://lucide.dev/) — ícones
- [Vitest](https://vitest.dev/) + Testing Library — testes

---

## API local simulada (JSON)

O app **não depende de backend**: ele consome uma **API local simulada em formato JSON**.

- Os dados de origem ficam em [`src/data/db.json`](src/data/db.json).
- A camada [`src/services/api.js`](src/services/api.js) expõe a mesma interface de uma API REST (`login`, `getProgresso`, `concluirMissao`, etc.), aplicando as regras de negócio (pontos, badges, streak, chronicle, chains) e persistindo o estado no **`localStorage`** do navegador.
- Toda a sincronização de saúde (passos/água/sono) é simulada em [`src/services/mockHealthApi.js`](src/services/mockHealthApi.js), imitando uma integração com Google Health.

> **Modo Edge (opcional):** defina `VITE_EDGE_URL` (veja [`.env.example`](.env.example)) apontando para o endpoint `GET /telemetria` do Node-RED para o app consumir a telemetria **real** do dispositivo ESP32 em vez do mock. Sem a variável, usa o mock. Se o dispositivo estiver offline, cai automaticamente no mock.

Como tudo roda no cliente, o projeto **publica no Vercel sem servidor** e funciona offline após o primeiro carregamento.

### Conta de demonstração

Já vem um usuário com dados de exemplo (histórico, missões, badges e amigos):

| Usuário | Senha   |
|---------|---------|
| `demo`  | `123456`|

Também é possível **criar uma conta nova** pela tela de cadastro. Amigos disponíveis para conectar no *Health Chains*: `ana@careplus.com`, `bruno@careplus.com`, `carla@careplus.com`.

---

## Funcionalidades

- **Autenticação** — cadastro e login (simulados via JSON local).
- **Onboarding** — apresentação do mascote Panda no primeiro acesso.
- **Dashboard** — score de saúde (Vitals Weather), estatísticas e tendências da semana.
- **Missões diárias** — passos, água e sono; concluir gera pontos, badges e streak.
- **The Chronicle** — agregação mensal dos dias ativos (heatmap por mês).
- **Health Chains** — conecte amigos por e-mail e acompanhe o impacto coletivo.
- **Perfil** — pontos, streak e catálogo de conquistas.
- **Tema reativo** — a interface muda de cor conforme o estado de saúde.

---

## Instalação e execução

**Pré-requisitos:** Node.js 18+ e npm.

```bash
# 1. Instale as dependências
npm install

# 2. Ambiente de desenvolvimento
npm run dev          # http://localhost:5173

# 3. Build de produção
npm run build
npm run preview

# 4. Testes
npm run test
```

### Deploy (Vercel)

O projeto é estático após o build. No Vercel, use **Framework Preset: Vite**, build command `npm run build` e output `dist/`. Não há variáveis de ambiente nem backend a configurar.

---

## Estrutura de pastas

```
src/
├── components/      # componentes reutilizáveis (cards, nav, gráficos, mascote)
├── context/         # AuthContext, ThemeContext, VitalsWeatherContext
├── data/
│   ├── constants.js # metas, pontos, badges, catálogo
│   └── db.json      # base de dados da API local simulada
├── hooks/           # useVitalsWeather, etc.
├── pages/           # Dashboard, Missões, Chronicle, HealthChains, Perfil, Login, Register...
├── services/
│   ├── api.js           # API local (localStorage + regras de negócio)
│   └── mockHealthApi.js # simulação de integração com wearables
├── App.jsx
├── index.css        # Tailwind + design tokens (CSS variables)
└── main.jsx
```

> O programa de console em Python da disciplina *Computational Thinking with Python* fica em [`python-console/`](python-console/) e roda de forma independente — veja o README de lá.

---

## Conceitos aplicados (Web Development)

| Recurso | Onde |
|---|---|
| Consumo de API (JSON local) | `services/api.js` + `data/db.json` |
| Manipulação de eventos / formulários | Login, Register, Missões, Health Chains |
| `localStorage` | `api.js`, `AuthContext`, `ThemeContext` |
| Componentes reutilizáveis + props pai→filho | `MissionCard`, `StatCard`, `PandaMascot`... |
| Desestruturação / spread | em todas as páginas e contextos |
| Operações matemáticas | score de saúde, % de progresso, densidade mensal |
| Tailwind CSS + responsividade | classes utilitárias em todas as telas |
| React moderno | hooks, Context API, custom hooks, React Router |

---

## Autores

- Cauã Pereira da Silva — RM568143
- Felipe Estevo Santos — RM567780
- Igor Grave Teixeira — RM567663
- Renan dos Reis Santos — RM568540
