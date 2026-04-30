# CarePlus+

Aplicação web de saúde gamificada desenvolvida em React + Vite como projeto do Challenge FIAP. O CarePlus+ incentiva hábitos saudáveis por meio de missões diárias, sistema de pontos e catálogo de recompensas.

---

## Tecnologias

- [React 18](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [React Router v6](https://reactrouter.com/)
- [lucide-react](https://lucide.dev/)
- [Bootstrap 5](https://getbootstrap.com/) (utilitários)

---

## Funcionalidades

- **Onboarding** — cadastro do usuário com aceite de termos LGPD
- **Connection Gate** — autorização de acesso ao Google Health antes de exibir o dashboard
- **Missões diárias** — passos, ingestão de água (meta: 3L) e sono sincronizados via mock API
- **Sistema de pontos** — pontos ganhos ao concluir missões, descontados ao resgatar recompensas
- **Catálogo de recompensas** — troca de pontos por benefícios exclusivos
- **Badges** — conquistas desbloqueadas automaticamente por ações do usuário
- **Streak** — contador de dias consecutivos com missões concluídas
- **Tema claro/escuro** — alternado via Context API, persistido no localStorage
- **Persistência** — estado do usuário salvo no localStorage com reset diário automático de missões

---

## Estrutura de pastas

```
src/
├── components/
│   ├── BadgeCard/
│   ├── ConnectionGate/
│   ├── DashboardLayout/
│   ├── MissionCard/
│   ├── Sidebar/
│   └── StatCard/
├── context/
│   ├── ConnectionContext.jsx
│   └── ThemeContext.jsx
├── data/
│   └── constants.js
├── hooks/
│   └── useLocalStorage.js
├── pages/
│   ├── CatalogoPage/
│   ├── DashboardPage/
│   ├── MissoesPage/
│   ├── OnboardingPage/
│   ├── PerfilPage/
│   └── PrivacidadePage/
├── services/
│   └── mockHealthApi.js
├── App.jsx
├── index.css
└── main.jsx
```

---

## Instalação e execução

**Pré-requisitos:** Node.js 18+ e npm instalados.

```bash
# 1. Clone o repositório
git clone <url-do-repositorio>
cd webdev-sprint2

# 2. Instale as dependências
npm install

# 3. Inicie o servidor de desenvolvimento
npm run dev
```

Acesse em: `http://localhost:5173`

### Build de produção

```bash
npm run build
npm run preview
```

---

## Conceitos JavaScript aplicados

| Recurso | Onde é usado |
|---|---|
| `localStorage` | `useLocalStorage`, `ThemeContext`, `ConnectionContext` |
| Desestruturação | Todos os componentes e páginas |
| Spread operator | `setUsuario` — atualização imutável do estado |
| `async/await` | `mockHealthApi.js` — simulação de chamada à API |
| Array methods | `.map()`, `.filter()`, `.includes()`, `.push()` |
| Context API | `ThemeContext`, `ConnectionContext` |
| Custom hooks | `useLocalStorage` |
| Operações matemáticas | Cálculo de pontos, progresso em % nas missões |
| Computed property names | `PrivacidadePage` — `{ [campo]: valor }` |

---

## Decisões de arquitetura

- **Dados de saúde são read-only** — sem botões de + / −, os valores vêm exclusivamente da mock API (`buscarDadosSaude`), simulando integração real com Google Health
- **Reset diário automático** — ao detectar mudança de data, `missoes_concluidas` é zerado antes de renderizar
- **CSS Grid nativo** — substituiu o sistema de colunas do Bootstrap nas grids de missões, stats e catálogo
- **Sidebar responsiva** — desktop: flutuante com glassmorphism; mobile: bottom tab bar fixa

---

## Autor

Cauã Pereira da Silva - RM568143
Felipe Estevo Santos - RM567780
Igor Grave Teixeira - RM567663
Renan dos Reis Santos - RM568540
