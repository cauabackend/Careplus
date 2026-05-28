# CarePlus+ V2 — Design Spec
**Data:** 2026-05-28  
**Status:** Aprovado  
**Disciplinas:** Computational Thinking with Python + Web Development

---

## 1. Contexto

O CarePlus+ V1 é um app React+Vite que guarda todos os dados em `localStorage`. O V2 migra para uma arquitetura full-stack real, satisfazendo os requisitos de duas disciplinas simultaneamente:

| Disciplina | Requisitos atendidos |
|---|---|
| Computational Thinking with Python | CRUD + persistência JSON/SQLite + try-except + funções + documentação |
| Web Development | React + Tailwind CSS + consumo de API JSON + DOM events + W3C semântico + GitHub |

---

## 2. Stack

| Camada | Tecnologia | Motivo |
|---|---|---|
| Frontend | React + Vite + Tailwind CSS | Mantém base existente, migra CSS para Tailwind |
| Backend | Django 5 + Django REST Framework | Melhor ORM do mercado, admin gratuito, DRF limpo |
| Banco | SQLite (padrão Django) | Arquivo local, satisfaz requisito de persistência |
| Auth | JWT via `djangorestframework-simplejwt` | Stateless, compatível com React em porta diferente |

---

## 3. Estrutura do Repositório

```
careplus/
├── backend/
│   ├── manage.py
│   ├── requirements.txt
│   ├── careplus/
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   └── api/
│       ├── models.py
│       ├── serializers.py
│       ├── views.py
│       ├── urls.py
│       └── tests.py
│
├── frontend/
│   ├── src/
│   │   ├── services/
│   │   │   └── api.js          ← único ponto de fetch
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── LoginPage/
│   │   │   ├── RegisterPage/
│   │   │   ├── DashboardPage/
│   │   │   ├── MissoesPage/
│   │   │   ├── ChroniclePage/
│   │   │   ├── SentinelPage/
│   │   │   ├── HealthChainsPage/
│   │   │   └── PerfilPage/
│   │   └── components/
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── README.md
└── .gitignore
```

---

## 4. Modelos do Banco de Dados

```python
# api/models.py

class Usuario(AbstractUser):
    """Estende o User padrão do Django com campos de gamificação."""
    pontos = IntegerField(default=0)
    streak = IntegerField(default=0)

class ProgressoDiario(Model):
    """Uma entrada por dia por usuário — base de todas as análises."""
    usuario   = ForeignKey(Usuario, on_delete=CASCADE)
    data      = DateField(auto_now_add=True)
    passos    = IntegerField(default=0)
    agua      = FloatField(default=0.0)    # litros
    sono      = FloatField(default=0.0)    # horas
    fonte     = CharField(max_length=50)   # "Google Health" | "Manual"

    class Meta:
        unique_together = ['usuario', 'data']  # um registro por dia

class MissaoConcluida(Model):
    """Registra cada missão concluída — base do Chronicle."""
    usuario       = ForeignKey(Usuario, on_delete=CASCADE)
    chave_missao  = CharField(max_length=20)  # "passos" | "agua" | "sono"
    pontos_ganhos = IntegerField()
    data          = DateField(auto_now_add=True)

    class Meta:
        unique_together = ['usuario', 'chave_missao', 'data']

class Badge(Model):
    """Badges conquistadas pelo usuário."""
    usuario        = ForeignKey(Usuario, on_delete=CASCADE)
    badge_id       = CharField(max_length=50)
    conquistada_em = DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['usuario', 'badge_id']

class SentinelAlert(Model):
    """Alertas gerados pelo SENTINEL — calculados on-demand."""
    TIPOS = [
        ('sleep_debt',      'Déficit de sono'),
        ('hydration_low',   'Hidratação baixa'),
        ('burnout_risk',    'Risco de burnout'),
        ('streak_break',    'Streak em risco'),
    ]
    usuario   = ForeignKey(Usuario, on_delete=CASCADE)
    tipo      = CharField(max_length=30, choices=TIPOS)
    mensagem  = CharField(max_length=255)
    criado_em = DateTimeField(auto_now_add=True)
    lido      = BooleanField(default=False)

class Conexao(Model):
    """Vínculo entre dois usuários no Health Chains."""
    origem  = ForeignKey(Usuario, on_delete=CASCADE, related_name='conexoes_saindo')
    destino = ForeignKey(Usuario, on_delete=CASCADE, related_name='conexoes_chegando')
    criada_em = DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['origem', 'destino']

class ChainEvent(Model):
    """Registra quando uma missão completada beneficia um amigo conectado."""
    origem  = ForeignKey(Usuario, on_delete=CASCADE, related_name='eventos_causados')
    destino = ForeignKey(Usuario, on_delete=CASCADE, related_name='eventos_recebidos')
    missao  = CharField(max_length=20)
    data    = DateField(auto_now_add=True)
```

---

## 5. Endpoints da API

Todos os endpoints (exceto auth) exigem `Authorization: Bearer <token>`.

### Autenticação
```
POST /api/auth/register/     → cadastro (nome, email, senha)
POST /api/auth/login/        → login → {access, refresh}
POST /api/auth/refresh/      → renova access token
```

### Usuário
```
GET  /api/usuario/           → perfil + pontos + streak
PUT  /api/usuario/           → atualiza nome ou senha
```

### Progresso de Saúde
```
GET  /api/progresso/         → progresso de hoje
POST /api/progresso/         → salva dados sincronizados
GET  /api/progresso/historico/ → últimos 14 dias (usado pelo SENTINEL e Chronicle)
```

### Missões
```
GET  /api/missoes/           → missões concluídas hoje
POST /api/missoes/           → conclui missão + adiciona pontos + verifica badges
```

### Badges
```
GET  /api/badges/            → todas as badges do usuário
```

### SENTINEL
```
GET  /api/sentinel/          → calcula alertas on-demand dos últimos 14 dias
PUT  /api/sentinel/{id}/     → marca alerta como lido
```

### The Chronicle
```
GET  /api/chronicle/         → agregação mensal: {ano, mês, dias_ativos, total_dias, densidade}
```

### Health Chains
```
GET  /api/chains/conexoes/         → lista amigos conectados
POST /api/chains/conexoes/         → cria conexão com outro usuário (por email)
DELETE /api/chains/conexoes/{id}/  → remove conexão
GET  /api/chains/eventos/          → eventos recebidos e causados
GET  /api/chains/impacto/          → total de pessoas beneficiadas no ano
```

---

## 6. Features de Gamificação

### 🌦 Vitals Weather
- **Onde vive:** Frontend (CSS variables)
- **Como funciona:** Score de saúde do dia (0–100) calculado a partir do `ProgressoDiario`. Mapeia para 4 estados: `excellent`, `good`, `warning`, `critical`. Toda a UI — background, sidebar, cards, panda mascote — muda de atmosfera.
- **Dependência backend:** `GET /api/progresso/` (já existe)

### 📖 The Chronicle
- **Onde vive:** Django agrega, React renderiza
- **Como funciona:** `GET /api/chronicle/` retorna por mês: quantos dias o usuário teve ao menos uma missão concluída vs. total de dias do mês. Frontend renderiza como um livro — páginas mais ou menos preenchidas. Mês sem dados = página em branco.
- **Compartilhamento:** MVP gera uma imagem estática via `canvas` no frontend.

### 🔮 SENTINEL
- **Onde vive:** Django calcula on-demand
- **Lógica de detecção** (algoritmos simples, sem ML):
  - `sleep_debt`: média de sono nos últimos 7 dias < 6.5h
  - `hydration_low`: média de água nos últimos 5 dias < 1.5L
  - `burnout_risk`: streak > 7 dias + sono médio < 6h + passos abaixo da meta em 4+ dias
  - `streak_break`: usuário tem streak ≥ 3 e ainda não registrou dados hoje
- **Resultado:** salva `SentinelAlert` se ainda não existir alerta do mesmo tipo nas últimas 24h

### ⛓ Health Chains (MVP)
- **Onde vive:** Django gerencia, React visualiza
- **MVP:** Criar conexão com amigo por email → quando A conclui missão → cria `ChainEvent` para todos os amigos conectados → amigos veem "X te ajudou hoje" → contador anual de pessoas beneficiadas
- **Fora do MVP:** propagação em múltiplos níveis (A→B→C→D), visualização de grafo

---

## 7. Frontend: Mudanças Principais

### CSS → Tailwind
```js
// tailwind.config.js
theme: {
  extend: {
    colors: {
      'cp-teal':    '#00BFDF',
      'cp-navy':    '#0B2454',
      'cp-orange':  '#F97316',
      'cp-gold':    '#F59E0B',
      'cp-success': '#10B981',
    }
  }
}
```
Todas as classes `.cp-*` e `.btn-cp` são reescritas como classes Tailwind nos componentes.

### AuthContext
Substitui o `localStorage` de usuário. Guarda `access token` em memória e `refresh token` em `localStorage`. Expõe: `usuario`, `login()`, `logout()`, `isAuthenticated`.

### api.js — Camada de fetch centralizada
Nenhum `fetch` direto nos componentes. Tudo passa por `src/services/api.js`.

### Páginas novas
- `LoginPage` e `RegisterPage` substituem o `OnboardingPage`
- `ChroniclePage`, `SentinelPage`, `HealthChainsPage` são novas
- `CatalogoPage` é removida

### Sidebar atualizada
```
Dashboard       (ícone: Home)
Missões         (ícone: CheckCircle)
The Chronicle   (ícone: BookOpen)
SENTINEL        (ícone: ShieldAlert)
Health Chains   (ícone: Link2)
Perfil          (ícone: User)
```

---

## 8. Requisitos de Entrega Atendidos

### Computational Thinking with Python
- [x] Validações com `try-except` em todos os views Django
- [x] Persistência em arquivo (SQLite = arquivo `db.sqlite3`)
- [x] CRUD completo: Usuario, ProgressoDiario, MissaoConcluida, Badge, SentinelAlert, Conexao, ChainEvent
- [x] Código organizado em funções (views, serializers, models)
- [x] Interface intuitiva (frontend React)
- [x] Documentação com comentários no código Python

### Web Development
- [x] Consumo de API JSON local (Django em `localhost:8000`)
- [x] DOM events: cliques, formulários, sincronização, resgate
- [x] Tailwind CSS em todos os componentes
- [x] W3C semântico: `<header>`, `<main>`, `<section>`, `<article>`, `aria-label`
- [x] Versionamento GitHub com histórico de commits

---

## 9. Setup de Desenvolvimento

```bash
# Backend
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver          # porta 8000

# Frontend
cd frontend
npm install
npm run dev                         # porta 5173
```

CORS configurado em `settings.py` para aceitar `localhost:5173`.

---

## 10. Fora de Escopo (V2)

- Health Chains em múltiplos níveis (A→B→C→D)
- Background jobs (Celery) para SENTINEL
- Integração real com Google Health OAuth2
- Deploy em produção
- Testes automatizados
