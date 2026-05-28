# CarePlus+ V2 — Backend Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Django REST API backend with JWT auth, all data models, and CRUD endpoints for the CarePlus+ V2 app.

**Architecture:** Single Django app (`api`) handles all models and views. Views are function-based with `@api_view` — demonstra claramente "organização em funções" (requisito da disciplina de Python). SQLite como persistência de arquivo.

**Tech Stack:** Python 3.12+, Django 5.0, djangorestframework 3.15, djangorestframework-simplejwt 5.3, django-cors-headers 4.3

---

## File Map

```
backend/
├── manage.py
├── requirements.txt
├── db.sqlite3                        ← gerado pelo migrate
├── careplus/
│   ├── __init__.py
│   ├── settings.py                   ← CRIAR: configuração completa
│   ├── urls.py                       ← CRIAR: rota raiz → api.urls
│   └── wsgi.py
└── api/
    ├── __init__.py
    ├── models.py                     ← CRIAR: 7 modelos
    ├── serializers.py                ← CRIAR: serializers de todos os modelos
    ├── views.py                      ← CRIAR: todas as views (FBV com @api_view)
    ├── sentinel.py                   ← CRIAR: funções de detecção de padrões
    ├── chronicle.py                  ← CRIAR: funções de agregação mensal
    ├── urls.py                       ← CRIAR: roteamento completo da API
    ├── admin.py                      ← MODIFICAR: registrar todos os modelos
    └── tests/
        ├── __init__.py
        ├── test_auth.py              ← CRIAR
        ├── test_progresso.py         ← CRIAR
        ├── test_missoes.py           ← CRIAR
        └── test_sentinel.py          ← CRIAR
```

---

## Task 1: Estrutura do projeto e dependências

**Files:**
- Create: `backend/` (diretório)
- Create: `backend/requirements.txt`

- [ ] **Passo 1: Criar estrutura de pastas e ambiente virtual**

```bash
# Na raiz do repo (careplus/)
mkdir backend
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate
```

- [ ] **Passo 2: Criar requirements.txt**

Conteúdo exato do arquivo `backend/requirements.txt`:
```
Django==5.0.6
djangorestframework==3.15.2
djangorestframework-simplejwt==5.3.1
django-cors-headers==4.3.1
```

- [ ] **Passo 3: Instalar dependências**

```bash
pip install -r requirements.txt
```

Saída esperada: instalação sem erros, terminando com `Successfully installed ...`

- [ ] **Passo 4: Criar projeto Django e app**

```bash
# Dentro de backend/
django-admin startproject careplus .
python manage.py startapp api
```

Resultado esperado:
```
backend/
├── manage.py
├── requirements.txt
├── careplus/
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
└── api/
    ├── models.py
    ├── views.py
    ├── admin.py
    └── tests.py
```

- [ ] **Passo 5: Criar pasta de testes no app**

```bash
mkdir api/tests
touch api/tests/__init__.py
# Remover o tests.py padrão
del api\tests.py   # Windows
# ou: rm api/tests.py (macOS/Linux)
```

- [ ] **Passo 6: Commit inicial**

```bash
cd ..  # volta à raiz do repo
git add backend/
git commit -m "chore: scaffold Django backend project"
```

---

## Task 2: Configuração do settings.py

**Files:**
- Modify: `backend/careplus/settings.py`

- [ ] **Passo 1: Substituir settings.py completo**

Conteúdo completo de `backend/careplus/settings.py`:
```python
"""
CarePlus+ V2 — Django Settings
"""
from pathlib import Path
from datetime import timedelta

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = 'django-insecure-careplus-dev-key-change-in-production'

DEBUG = True

ALLOWED_HOSTS = ['localhost', '127.0.0.1']

# ── Apps ──────────────────────────────────────────────────────
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # Terceiros
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    # Nosso app
    'api',
]

# ── Middleware ─────────────────────────────────────────────────
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',   # deve ser o primeiro
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'careplus.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'careplus.wsgi.application'

# ── Banco de dados ─────────────────────────────────────────────
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# ── Auth customizado ───────────────────────────────────────────
AUTH_USER_MODEL = 'api.Usuario'

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
]

# ── DRF ───────────────────────────────────────────────────────
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
}

# ── JWT ───────────────────────────────────────────────────────
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME':  timedelta(hours=2),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'AUTH_HEADER_TYPES':      ('Bearer',),
}

# ── CORS ──────────────────────────────────────────────────────
CORS_ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
]

# ── Internacionalização ───────────────────────────────────────
LANGUAGE_CODE = 'pt-br'
TIME_ZONE     = 'America/Sao_Paulo'
USE_I18N      = True
USE_TZ        = True

STATIC_URL      = '/static/'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
```

- [ ] **Passo 2: Verificar que Django carrega sem erros**

```bash
cd backend
python manage.py check
```

Saída esperada: `System check identified no issues (0 silenced).`

- [ ] **Passo 3: Commit**

```bash
git add backend/careplus/settings.py
git commit -m "feat: configure Django settings (DRF, JWT, CORS, SQLite)"
```

---

## Task 3: Modelos do banco de dados

**Files:**
- Modify: `backend/api/models.py`

- [ ] **Passo 1: Escrever teste que falha primeiro**

Criar `backend/api/tests/test_models.py`:
```python
"""Testes dos modelos do banco de dados."""
from django.test import TestCase
from django.contrib.auth import get_user_model
from api.models import ProgressoDiario, MissaoConcluida, Badge, SentinelAlert, Conexao, ChainEvent
import datetime

Usuario = get_user_model()


class UsuarioModelTest(TestCase):
    def test_criar_usuario_com_pontos_e_streak(self):
        """Usuario deve iniciar com pontos=0 e streak=0."""
        u = Usuario.objects.create_user(
            username='carol', email='carol@test.com', password='senha123'
        )
        self.assertEqual(u.pontos, 0)
        self.assertEqual(u.streak, 0)


class ProgressoDiarioModelTest(TestCase):
    def setUp(self):
        self.usuario = Usuario.objects.create_user(username='carol', password='senha123')

    def test_criar_progresso(self):
        """ProgressoDiario deve ser criado com os campos corretos."""
        p = ProgressoDiario.objects.create(
            usuario=self.usuario,
            passos=8000,
            agua=2.0,
            sono=7.5,
            fonte='Google Health',
        )
        self.assertEqual(p.passos, 8000)
        self.assertEqual(p.agua, 2.0)

    def test_unique_por_dia(self):
        """Deve bloquear dois registros do mesmo usuário no mesmo dia."""
        from django.db import IntegrityError
        ProgressoDiario.objects.create(usuario=self.usuario, passos=5000, agua=1.5, sono=6.0, fonte='Manual')
        with self.assertRaises(IntegrityError):
            ProgressoDiario.objects.create(usuario=self.usuario, passos=6000, agua=2.0, sono=7.0, fonte='Manual')


class MissaoConcluidaModelTest(TestCase):
    def setUp(self):
        self.usuario = Usuario.objects.create_user(username='carol', password='senha123')

    def test_criar_missao_concluida(self):
        m = MissaoConcluida.objects.create(
            usuario=self.usuario,
            chave_missao='passos',
            pontos_ganhos=100,
        )
        self.assertEqual(m.chave_missao, 'passos')

    def test_unique_missao_por_dia(self):
        """Mesma missão não pode ser concluída duas vezes no mesmo dia."""
        from django.db import IntegrityError
        MissaoConcluida.objects.create(usuario=self.usuario, chave_missao='agua', pontos_ganhos=40)
        with self.assertRaises(IntegrityError):
            MissaoConcluida.objects.create(usuario=self.usuario, chave_missao='agua', pontos_ganhos=40)
```

- [ ] **Passo 2: Rodar o teste para confirmar que falha**

```bash
cd backend
python manage.py test api.tests.test_models
```

Saída esperada: `ImportError: cannot import name 'ProgressoDiario' from 'api.models'`

- [ ] **Passo 3: Implementar todos os modelos**

Conteúdo completo de `backend/api/models.py`:
```python
"""
Modelos do CarePlus+ V2.
Cada classe representa uma tabela no banco SQLite.
"""
from django.contrib.auth.models import AbstractUser
from django.db import models


class Usuario(AbstractUser):
    """
    Estende o User padrão do Django com dados de gamificação.
    AbstractUser já fornece: username, email, password, first_name, last_name.
    """
    pontos = models.IntegerField(default=0)
    streak = models.IntegerField(default=0)

    def __str__(self):
        return self.username


class ProgressoDiario(models.Model):
    """
    Registro de saúde do dia.
    Uma única entrada por usuário por data (unique_together).
    """
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='progressos')
    data    = models.DateField(auto_now_add=True)
    passos  = models.IntegerField(default=0)
    agua    = models.FloatField(default=0.0)   # litros
    sono    = models.FloatField(default=0.0)   # horas
    fonte   = models.CharField(max_length=50, default='Manual')

    class Meta:
        unique_together = ['usuario', 'data']
        ordering        = ['-data']

    def __str__(self):
        return f'{self.usuario.username} — {self.data}'


class MissaoConcluida(models.Model):
    """
    Missão diária concluída pelo usuário.
    Chaves válidas: 'passos', 'agua', 'sono'.
    """
    CHAVES = [
        ('passos', 'Passos'),
        ('agua',   'Ingestão de Água'),
        ('sono',   'Sono'),
    ]
    usuario       = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='missoes')
    chave_missao  = models.CharField(max_length=20, choices=CHAVES)
    pontos_ganhos = models.IntegerField()
    data          = models.DateField(auto_now_add=True)

    class Meta:
        unique_together = ['usuario', 'chave_missao', 'data']
        ordering        = ['-data']

    def __str__(self):
        return f'{self.usuario.username} — {self.chave_missao} — {self.data}'


class Badge(models.Model):
    """Badge conquistada. Cada badge_id é único por usuário."""
    usuario        = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='badges')
    badge_id       = models.CharField(max_length=50)
    conquistada_em = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['usuario', 'badge_id']

    def __str__(self):
        return f'{self.usuario.username} — {self.badge_id}'


class SentinelAlert(models.Model):
    """
    Alerta gerado pelo SENTINEL após análise de padrões de saúde.
    Calculado on-demand (ao abrir a página SENTINEL).
    """
    TIPOS = [
        ('sleep_debt',    'Déficit de sono'),
        ('hydration_low', 'Hidratação baixa'),
        ('burnout_risk',  'Risco de burnout'),
        ('streak_break',  'Streak em risco'),
    ]
    usuario   = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='alertas')
    tipo      = models.CharField(max_length=30, choices=TIPOS)
    mensagem  = models.CharField(max_length=255)
    criado_em = models.DateTimeField(auto_now_add=True)
    lido      = models.BooleanField(default=False)

    class Meta:
        ordering = ['-criado_em']

    def __str__(self):
        return f'{self.usuario.username} — {self.tipo}'


class Conexao(models.Model):
    """Vínculo entre dois usuários no Health Chains."""
    origem    = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='conexoes_saindo')
    destino   = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='conexoes_chegando')
    criada_em = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['origem', 'destino']

    def __str__(self):
        return f'{self.origem.username} → {self.destino.username}'


class ChainEvent(models.Model):
    """
    Evento gerado quando uma missão concluída beneficia um amigo conectado.
    Base do cálculo de impacto anual do Health Chains.
    """
    origem  = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='eventos_causados')
    destino = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='eventos_recebidos')
    missao  = models.CharField(max_length=20)
    data    = models.DateField(auto_now_add=True)

    class Meta:
        ordering = ['-data']

    def __str__(self):
        return f'{self.origem.username} ajudou {self.destino.username} ({self.missao})'
```

- [ ] **Passo 4: Registrar modelos no admin**

Conteúdo de `backend/api/admin.py`:
```python
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Usuario, ProgressoDiario, MissaoConcluida, Badge, SentinelAlert, Conexao, ChainEvent

admin.site.register(Usuario, UserAdmin)
admin.site.register(ProgressoDiario)
admin.site.register(MissaoConcluida)
admin.site.register(Badge)
admin.site.register(SentinelAlert)
admin.site.register(Conexao)
admin.site.register(ChainEvent)
```

- [ ] **Passo 5: Criar e aplicar migrations**

```bash
python manage.py makemigrations api
python manage.py migrate
```

Saída esperada: `Applying api.0001_initial... OK`

- [ ] **Passo 6: Rodar testes e confirmar que passam**

```bash
python manage.py test api.tests.test_models -v 2
```

Saída esperada:
```
test_criar_missao_concluida ... ok
test_criar_progresso ... ok
test_criar_usuario_com_pontos_e_streak ... ok
test_unique_missao_por_dia ... ok
test_unique_por_dia ... ok
Ran 5 tests in 0.XXXs
OK
```

- [ ] **Passo 7: Commit**

```bash
git add backend/api/models.py backend/api/admin.py backend/api/migrations/ backend/api/tests/
git commit -m "feat: add all Django models (Usuario, Progresso, Missao, Badge, Sentinel, Chains)"
```

---

## Task 4: Serializers

**Files:**
- Create: `backend/api/serializers.py`

- [ ] **Passo 1: Criar serializers.py**

Conteúdo completo de `backend/api/serializers.py`:
```python
"""
Serializers do CarePlus+ V2.
Convertem objetos Django para JSON e validam dados de entrada.
"""
from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import ProgressoDiario, MissaoConcluida, Badge, SentinelAlert, Conexao, ChainEvent

Usuario = get_user_model()


# ── Auth ──────────────────────────────────────────────────────

class RegisterSerializer(serializers.ModelSerializer):
    """Serializer para cadastro de novo usuário."""
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model  = Usuario
        fields = ['username', 'email', 'first_name', 'password']

    def validate_email(self, value):
        """Garante que o e-mail não está em uso."""
        if Usuario.objects.filter(email=value).exists():
            raise serializers.ValidationError('Este e-mail já está cadastrado.')
        return value

    def create(self, validated_data):
        """Cria usuário com senha hasheada."""
        return Usuario.objects.create_user(**validated_data)


class UsuarioSerializer(serializers.ModelSerializer):
    """Retorna dados públicos do usuário autenticado."""
    class Meta:
        model  = Usuario
        fields = ['id', 'username', 'email', 'first_name', 'pontos', 'streak']
        read_only_fields = ['id', 'pontos', 'streak']


# ── Progresso ─────────────────────────────────────────────────

class ProgressoDiarioSerializer(serializers.ModelSerializer):
    class Meta:
        model  = ProgressoDiario
        fields = ['id', 'data', 'passos', 'agua', 'sono', 'fonte']
        read_only_fields = ['id', 'data']

    def validate_passos(self, value):
        if value < 0:
            raise serializers.ValidationError('Passos não pode ser negativo.')
        return value

    def validate_agua(self, value):
        if value < 0:
            raise serializers.ValidationError('Água não pode ser negativa.')
        if value > 20:
            raise serializers.ValidationError('Valor de água improvável (máx 20L).')
        return value

    def validate_sono(self, value):
        if value < 0:
            raise serializers.ValidationError('Sono não pode ser negativo.')
        if value > 24:
            raise serializers.ValidationError('Sono não pode exceder 24 horas.')
        return value


# ── Missões ───────────────────────────────────────────────────

class MissaoConcluidaSerializer(serializers.ModelSerializer):
    class Meta:
        model  = MissaoConcluida
        fields = ['id', 'chave_missao', 'pontos_ganhos', 'data']
        read_only_fields = ['id', 'pontos_ganhos', 'data']


# ── Badges ───────────────────────────────────────────────────

class BadgeSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Badge
        fields = ['id', 'badge_id', 'conquistada_em']
        read_only_fields = ['id', 'conquistada_em']


# ── SENTINEL ─────────────────────────────────────────────────

class SentinelAlertSerializer(serializers.ModelSerializer):
    class Meta:
        model  = SentinelAlert
        fields = ['id', 'tipo', 'mensagem', 'criado_em', 'lido']
        read_only_fields = ['id', 'tipo', 'mensagem', 'criado_em']


# ── Health Chains ─────────────────────────────────────────────

class ConexaoSerializer(serializers.ModelSerializer):
    destino_username = serializers.CharField(source='destino.username', read_only=True)
    destino_email    = serializers.EmailField(write_only=True)

    class Meta:
        model  = Conexao
        fields = ['id', 'destino_username', 'destino_email', 'criada_em']
        read_only_fields = ['id', 'destino_username', 'criada_em']

    def validate_destino_email(self, value):
        try:
            usuario = Usuario.objects.get(email=value)
            return value
        except Usuario.DoesNotExist:
            raise serializers.ValidationError('Usuário com este e-mail não encontrado.')

    def create(self, validated_data):
        destino = Usuario.objects.get(email=validated_data.pop('destino_email'))
        origem  = self.context['request'].user
        if origem == destino:
            raise serializers.ValidationError('Você não pode se conectar a si mesmo.')
        return Conexao.objects.create(origem=origem, destino=destino)


class ChainEventSerializer(serializers.ModelSerializer):
    origem_username  = serializers.CharField(source='origem.username',  read_only=True)
    destino_username = serializers.CharField(source='destino.username', read_only=True)

    class Meta:
        model  = ChainEvent
        fields = ['id', 'origem_username', 'destino_username', 'missao', 'data']
```

- [ ] **Passo 2: Verificar que não há erros de importação**

```bash
python manage.py shell -c "from api.serializers import RegisterSerializer; print('OK')"
```

Saída esperada: `OK`

- [ ] **Passo 3: Commit**

```bash
git add backend/api/serializers.py
git commit -m "feat: add DRF serializers with input validation"
```

---

## Task 5: Lógica do SENTINEL

**Files:**
- Create: `backend/api/sentinel.py`
- Create: `backend/api/tests/test_sentinel.py`

- [ ] **Passo 1: Escrever testes que falham**

Conteúdo de `backend/api/tests/test_sentinel.py`:
```python
"""Testes da lógica de detecção de padrões do SENTINEL."""
from django.test import TestCase
from django.contrib.auth import get_user_model
from api.models import ProgressoDiario
from api.sentinel import (
    detectar_deficit_sono,
    detectar_hidratacao_baixa,
    detectar_risco_burnout,
)
import datetime

Usuario = get_user_model()


def criar_progresso(usuario, sono, agua, passos, dias_atras=0):
    """Helper: cria ProgressoDiario com data relativa a hoje."""
    from api.models import ProgressoDiario
    data = datetime.date.today() - datetime.timedelta(days=dias_atras)
    return ProgressoDiario.objects.create(
        usuario=usuario, sono=sono, agua=agua, passos=passos,
        fonte='Test', data=data,
    )


class SentinelDeficitSonoTest(TestCase):
    def setUp(self):
        self.usuario = Usuario.objects.create_user(username='carol', password='senha123')

    def test_retorna_false_com_poucos_dados(self):
        """Menos de 3 registros → não detecta padrão."""
        historico = [criar_progresso(self.usuario, sono=5.0, agua=2.0, passos=5000, dias_atras=i) for i in range(2)]
        self.assertFalse(detectar_deficit_sono(historico))

    def test_detecta_deficit_sono_baixo(self):
        """Média < 6.5h em 7 dias → detecta déficit."""
        historico = [criar_progresso(self.usuario, sono=5.5, agua=2.0, passos=5000, dias_atras=i) for i in range(7)]
        self.assertTrue(detectar_deficit_sono(historico))

    def test_nao_detecta_sono_adequado(self):
        """Média >= 6.5h → não detecta déficit."""
        historico = [criar_progresso(self.usuario, sono=7.0, agua=2.0, passos=8000, dias_atras=i) for i in range(7)]
        self.assertFalse(detectar_deficit_sono(historico))


class SentinelHidratacaoTest(TestCase):
    def setUp(self):
        self.usuario = Usuario.objects.create_user(username='carol2', password='senha123')

    def test_detecta_hidratacao_baixa(self):
        """Média < 1.5L em 5 dias → detecta."""
        historico = [criar_progresso(self.usuario, sono=7.0, agua=1.0, passos=8000, dias_atras=i) for i in range(5)]
        self.assertTrue(detectar_hidratacao_baixa(historico))

    def test_nao_detecta_hidratacao_ok(self):
        historico = [criar_progresso(self.usuario, sono=7.0, agua=2.5, passos=8000, dias_atras=i) for i in range(5)]
        self.assertFalse(detectar_hidratacao_baixa(historico))
```

- [ ] **Passo 2: Rodar para confirmar que falha**

```bash
python manage.py test api.tests.test_sentinel
```

Saída esperada: `ImportError: cannot import name 'detectar_deficit_sono' from 'api.sentinel'`

- [ ] **Passo 3: Implementar sentinel.py**

Conteúdo completo de `backend/api/sentinel.py`:
```python
"""
CarePlus+ SENTINEL — Detecção de padrões de saúde.

Funções puras que analisam o histórico de ProgressoDiario
e retornam True quando um padrão de risco é identificado.
Cada função usa try-except para tratar dados ausentes ou inválidos.
"""
import datetime
from django.utils import timezone


# ── Constantes ────────────────────────────────────────────────

META_SONO_MINIMA      = 6.5   # horas
META_AGUA_MINIMA      = 1.5   # litros
META_PASSOS_DIARIA    = 7500
STREAK_RISCO_BURNOUT  = 7     # dias consecutivos
SONO_CRITICO_BURNOUT  = 6.0   # horas
DIAS_PASSOS_ABAIXO    = 4     # em 7 dias


# ── Funções de detecção ───────────────────────────────────────

def detectar_deficit_sono(historico):
    """
    Detecta déficit de sono nos últimos 7 dias.

    Args:
        historico: lista de ProgressoDiario ordenada por data desc

    Returns:
        bool: True se média de sono < 6.5h com ao menos 3 registros
    """
    try:
        registros = [p.sono for p in historico if p.sono > 0]
        if len(registros) < 3:
            return False
        amostra = registros[:7]   # os 7 mais recentes
        media = sum(amostra) / len(amostra)
        return media < META_SONO_MINIMA
    except (TypeError, ValueError, ZeroDivisionError):
        return False


def detectar_hidratacao_baixa(historico):
    """
    Detecta hidratação persistentemente baixa nos últimos 5 dias.

    Args:
        historico: lista de ProgressoDiario ordenada por data desc

    Returns:
        bool: True se média de água < 1.5L com ao menos 3 registros
    """
    try:
        registros = [p.agua for p in historico if p.agua > 0]
        if len(registros) < 3:
            return False
        amostra = registros[:5]
        media = sum(amostra) / len(amostra)
        return media < META_AGUA_MINIMA
    except (TypeError, ValueError, ZeroDivisionError):
        return False


def detectar_risco_burnout(historico, usuario):
    """
    Detecta risco de burnout: streak alto + sono insuficiente + passos abaixo da meta.

    Critério: streak >= 7 dias E média de sono < 6h E 4+ dias sem bater meta de passos.

    Args:
        historico: lista de ProgressoDiario (últimos 7 dias)
        usuario:   instância de Usuario (para verificar streak)

    Returns:
        bool: True se todos os critérios forem atendidos
    """
    try:
        if usuario.streak < STREAK_RISCO_BURNOUT:
            return False
        amostra = historico[:7]
        if len(amostra) < 5:
            return False
        media_sono = sum(p.sono for p in amostra) / len(amostra)
        dias_sem_meta = sum(1 for p in amostra if p.passos < META_PASSOS_DIARIA)
        return media_sono < SONO_CRITICO_BURNOUT and dias_sem_meta >= DIAS_PASSOS_ABAIXO
    except (TypeError, ValueError, ZeroDivisionError, AttributeError):
        return False


def detectar_streak_em_risco(usuario):
    """
    Detecta se o usuário tem streak >= 3 e ainda não registrou dados hoje.

    Args:
        usuario: instância de Usuario

    Returns:
        bool: True se streak >= 3 e nenhum ProgressoDiario hoje
    """
    try:
        from .models import ProgressoDiario
        if usuario.streak < 3:
            return False
        hoje = datetime.date.today()
        return not ProgressoDiario.objects.filter(usuario=usuario, data=hoje).exists()
    except Exception:
        return False


def gerar_alertas(usuario, historico):
    """
    Executa todas as detecções e retorna lista de alertas a criar.

    Args:
        usuario:   instância de Usuario
        historico: lista de ProgressoDiario dos últimos 14 dias

    Returns:
        list[dict]: lista de {'tipo': str, 'mensagem': str}
    """
    alertas = []

    if detectar_deficit_sono(historico):
        alertas.append({
            'tipo':     'sleep_debt',
            'mensagem': 'Sua média de sono está abaixo de 6h30 nos últimos dias. '
                        'Tente dormir mais cedo hoje.',
        })

    if detectar_hidratacao_baixa(historico):
        alertas.append({
            'tipo':     'hydration_low',
            'mensagem': 'Você está bebendo menos de 1,5L por dia esta semana. '
                        'Lembre-se de se hidratar regularmente.',
        })

    if detectar_risco_burnout(historico, usuario):
        alertas.append({
            'tipo':     'burnout_risk',
            'mensagem': 'Sinal de alerta: muitos dias seguidos com pouco sono e atividade abaixo do esperado. '
                        'Considere descansar amanhã.',
        })

    if detectar_streak_em_risco(usuario):
        alertas.append({
            'tipo':     'streak_break',
            'mensagem': f'Seu streak de {usuario.streak} dias está em risco! '
                        'Registre seu progresso hoje para mantê-lo.',
        })

    return alertas
```

- [ ] **Passo 4: Rodar testes e confirmar que passam**

```bash
python manage.py test api.tests.test_sentinel -v 2
```

Saída esperada: `Ran 5 tests in 0.XXXs  OK`

- [ ] **Passo 5: Commit**

```bash
git add backend/api/sentinel.py backend/api/tests/test_sentinel.py
git commit -m "feat: add SENTINEL pattern detection logic with try-except"
```

---

## Task 6: Lógica do Chronicle

**Files:**
- Create: `backend/api/chronicle.py`

- [ ] **Passo 1: Implementar chronicle.py**

Conteúdo completo de `backend/api/chronicle.py`:
```python
"""
CarePlus+ The Chronicle — Agregação mensal de progresso.

Transforma o histórico de MissaoConcluida numa narrativa mensal:
cada mês retorna quantos dias foram ativos vs. o total de dias do mês.
"""
import calendar
import datetime
from django.db.models import Count
from django.db.models.functions import TruncMonth


def calcular_chronicle(usuario):
    """
    Agrega missões concluídas por mês para o usuário.

    Returns:
        list[dict]: lista ordenada do mais recente para o mais antigo.
        Cada item: {
            'ano': int,
            'mes': int,
            'mes_nome': str,       ex: 'maio'
            'dias_ativos': int,    dias com ao menos 1 missão
            'total_dias': int,     total de dias do mês
            'densidade': float,    0.0 a 1.0
        }
    """
    try:
        from .models import MissaoConcluida

        resultado = (
            MissaoConcluida.objects
            .filter(usuario=usuario)
            .annotate(mes=TruncMonth('data'))
            .values('mes')
            .annotate(dias_ativos=Count('data', distinct=True))
            .order_by('-mes')
        )

        meses = []
        NOMES_MESES = [
            '', 'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
            'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
        ]

        for item in resultado:
            ano        = item['mes'].year
            mes        = item['mes'].month
            total_dias = calendar.monthrange(ano, mes)[1]
            dias_ativos = item['dias_ativos']

            meses.append({
                'ano':         ano,
                'mes':         mes,
                'mes_nome':    NOMES_MESES[mes],
                'dias_ativos': dias_ativos,
                'total_dias':  total_dias,
                'densidade':   round(dias_ativos / total_dias, 2),
            })

        return meses

    except Exception:
        return []
```

- [ ] **Passo 2: Verificar importação**

```bash
python manage.py shell -c "from api.chronicle import calcular_chronicle; print('OK')"
```

Saída esperada: `OK`

- [ ] **Passo 3: Commit**

```bash
git add backend/api/chronicle.py
git commit -m "feat: add Chronicle monthly aggregation logic"
```

---

## Task 7: Views da API

**Files:**
- Create: `backend/api/views.py`

- [ ] **Passo 1: Implementar views.py completo**

Conteúdo completo de `backend/api/views.py`:
```python
"""
Views da API CarePlus+ V2.
Todas as views são function-based com @api_view.
Cada view usa try-except para tratamento robusto de erros.
"""
import datetime
from django.contrib.auth import get_user_model
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import (
    ProgressoDiario, MissaoConcluida, Badge,
    SentinelAlert, Conexao, ChainEvent,
)
from .serializers import (
    RegisterSerializer, UsuarioSerializer,
    ProgressoDiarioSerializer, MissaoConcluidaSerializer,
    BadgeSerializer, SentinelAlertSerializer,
    ConexaoSerializer, ChainEventSerializer,
)
from .sentinel  import gerar_alertas
from .chronicle import calcular_chronicle

Usuario = get_user_model()

# ── Pontos por missão (espelho do frontend) ──────────────────
PONTOS_POR_MISSAO = {'passos': 100, 'agua': 40, 'sono': 60}

# ── Mapeamento missão → badge ─────────────────────────────────
BADGE_POR_MISSAO = {
    'passos': 'caminhante',
    'agua':   'hidratado',
    'sono':   'bom_sono',
}


# ════════════════════════════════════════════════════════════════
# AUTH
# ════════════════════════════════════════════════════════════════

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """
    Cadastra novo usuário.
    POST /api/auth/register/
    Body: { username, email, first_name, password }
    """
    try:
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            usuario = serializer.save()
            # Badge de boas-vindas
            Badge.objects.create(usuario=usuario, badge_id='primeiro_login')
            return Response(
                UsuarioSerializer(usuario).data,
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'erro': 'Erro ao criar conta.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ════════════════════════════════════════════════════════════════
# USUÁRIO
# ════════════════════════════════════════════════════════════════

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def usuario_detail(request):
    """
    GET  /api/usuario/  → retorna perfil do usuário autenticado
    PUT  /api/usuario/  → atualiza first_name
    """
    try:
        if request.method == 'GET':
            return Response(UsuarioSerializer(request.user).data)

        serializer = UsuarioSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception:
        return Response({'erro': 'Erro ao processar usuário.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ════════════════════════════════════════════════════════════════
# PROGRESSO DIÁRIO
# ════════════════════════════════════════════════════════════════

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def progresso_hoje(request):
    """
    GET  /api/progresso/  → progresso de hoje (ou null)
    POST /api/progresso/  → cria ou atualiza progresso de hoje
    """
    try:
        hoje = datetime.date.today()
        usuario = request.user

        if request.method == 'GET':
            try:
                progresso = ProgressoDiario.objects.get(usuario=usuario, data=hoje)
                return Response(ProgressoDiarioSerializer(progresso).data)
            except ProgressoDiario.DoesNotExist:
                return Response(None)

        # POST — cria ou atualiza
        progresso, _ = ProgressoDiario.objects.get_or_create(
            usuario=usuario, data=hoje,
            defaults={'passos': 0, 'agua': 0.0, 'sono': 0.0, 'fonte': 'Manual'},
        )
        serializer = ProgressoDiarioSerializer(progresso, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    except Exception:
        return Response({'erro': 'Erro ao salvar progresso.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def progresso_historico(request):
    """
    GET /api/progresso/historico/  → últimos 14 dias
    Usado pelo SENTINEL e pelo Chronicle.
    """
    try:
        quatorze_dias_atras = datetime.date.today() - datetime.timedelta(days=14)
        historico = ProgressoDiario.objects.filter(
            usuario=request.user,
            data__gte=quatorze_dias_atras,
        )
        return Response(ProgressoDiarioSerializer(historico, many=True).data)
    except Exception:
        return Response({'erro': 'Erro ao buscar histórico.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ════════════════════════════════════════════════════════════════
# MISSÕES
# ════════════════════════════════════════════════════════════════

def _verificar_e_conceder_badges(usuario, chave_missao):
    """
    Verifica se o usuário merece badges após concluir uma missão.
    Retorna lista de badge_ids concedidos agora.
    """
    badges_ganhas = []

    # Badge específica da missão
    badge_id = BADGE_POR_MISSAO.get(chave_missao)
    if badge_id:
        _, criado = Badge.objects.get_or_create(usuario=usuario, badge_id=badge_id)
        if criado:
            badges_ganhas.append(badge_id)

    # Badge "primeira_missao" — uma vez na vida
    _, criado = Badge.objects.get_or_create(usuario=usuario, badge_id='primeira_missao')
    if criado:
        badges_ganhas.append('primeira_missao')

    return badges_ganhas


def _criar_chain_events(usuario, chave_missao):
    """
    Cria ChainEvents para todos os amigos conectados.
    Retorna quantidade de eventos criados.
    """
    try:
        amigos = Conexao.objects.filter(origem=usuario).select_related('destino')
        hoje = datetime.date.today()
        count = 0
        for conexao in amigos:
            ChainEvent.objects.get_or_create(
                origem=usuario,
                destino=conexao.destino,
                missao=chave_missao,
                data=hoje,
            )
            count += 1
        return count
    except Exception:
        return 0


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def missoes(request):
    """
    GET  /api/missoes/  → missões concluídas hoje
    POST /api/missoes/  → conclui missão + pontos + badges + chain events
    Body POST: { chave_missao: 'passos' | 'agua' | 'sono' }
    """
    try:
        usuario = request.user
        hoje    = datetime.date.today()

        if request.method == 'GET':
            qs = MissaoConcluida.objects.filter(usuario=usuario, data=hoje)
            return Response(MissaoConcluidaSerializer(qs, many=True).data)

        # POST — concluir missão
        chave = request.data.get('chave_missao', '').strip()
        if chave not in PONTOS_POR_MISSAO:
            return Response({'erro': 'Missão inválida. Use: passos, agua ou sono.'}, status=status.HTTP_400_BAD_REQUEST)

        # Verifica duplicata
        if MissaoConcluida.objects.filter(usuario=usuario, chave_missao=chave, data=hoje).exists():
            return Response({'erro': 'Missão já concluída hoje.'}, status=status.HTTP_400_BAD_REQUEST)

        pontos = PONTOS_POR_MISSAO[chave]

        # Cria registro
        missao = MissaoConcluida.objects.create(
            usuario=usuario,
            chave_missao=chave,
            pontos_ganhos=pontos,
        )

        # Atualiza pontos e streak
        usuario.pontos += pontos
        usuario.streak += 1
        usuario.save(update_fields=['pontos', 'streak'])

        # Badges
        badges_ganhas = _verificar_e_conceder_badges(usuario, chave)

        # Chain events para amigos
        chain_count = _criar_chain_events(usuario, chave)

        return Response({
            'missao':               MissaoConcluidaSerializer(missao).data,
            'pontos_ganhos':        pontos,
            'pontos_total':         usuario.pontos,
            'badges_ganhas':        badges_ganhas,
            'chain_events_criados': chain_count,
        }, status=status.HTTP_201_CREATED)

    except Exception:
        return Response({'erro': 'Erro ao processar missão.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ════════════════════════════════════════════════════════════════
# BADGES
# ════════════════════════════════════════════════════════════════

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def badges(request):
    """GET /api/badges/ → todas as badges do usuário."""
    try:
        qs = Badge.objects.filter(usuario=request.user)
        return Response(BadgeSerializer(qs, many=True).data)
    except Exception:
        return Response({'erro': 'Erro ao buscar badges.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ════════════════════════════════════════════════════════════════
# SENTINEL
# ════════════════════════════════════════════════════════════════

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def sentinel(request):
    """
    GET /api/sentinel/
    Calcula alertas on-demand, salva novos, retorna todos não lidos.
    """
    try:
        usuario = request.user
        quatorze_dias_atras = datetime.date.today() - datetime.timedelta(days=14)
        historico = list(ProgressoDiario.objects.filter(
            usuario=usuario,
            data__gte=quatorze_dias_atras,
        ))

        # Gera e salva alertas novos (evita duplicatas nas últimas 24h)
        alertas_novos = gerar_alertas(usuario, historico)
        ontem = datetime.datetime.now() - datetime.timedelta(hours=24)
        for alerta in alertas_novos:
            ja_existe = SentinelAlert.objects.filter(
                usuario=usuario,
                tipo=alerta['tipo'],
                criado_em__gte=ontem,
            ).exists()
            if not ja_existe:
                SentinelAlert.objects.create(usuario=usuario, **alerta)

        # Retorna alertas não lidos
        alertas = SentinelAlert.objects.filter(usuario=usuario, lido=False)
        return Response(SentinelAlertSerializer(alertas, many=True).data)
    except Exception:
        return Response({'erro': 'Erro no SENTINEL.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def sentinel_marcar_lido(request, pk):
    """PUT /api/sentinel/<pk>/ → marca alerta como lido."""
    try:
        alerta = SentinelAlert.objects.get(pk=pk, usuario=request.user)
        alerta.lido = True
        alerta.save(update_fields=['lido'])
        return Response(SentinelAlertSerializer(alerta).data)
    except SentinelAlert.DoesNotExist:
        return Response({'erro': 'Alerta não encontrado.'}, status=status.HTTP_404_NOT_FOUND)
    except Exception:
        return Response({'erro': 'Erro ao atualizar alerta.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ════════════════════════════════════════════════════════════════
# THE CHRONICLE
# ════════════════════════════════════════════════════════════════

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def chronicle(request):
    """GET /api/chronicle/ → agregação mensal de missões concluídas."""
    try:
        dados = calcular_chronicle(request.user)
        return Response(dados)
    except Exception:
        return Response({'erro': 'Erro ao calcular Chronicle.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ════════════════════════════════════════════════════════════════
# HEALTH CHAINS
# ════════════════════════════════════════════════════════════════

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def chains_conexoes(request):
    """
    GET  /api/chains/conexoes/  → lista amigos conectados
    POST /api/chains/conexoes/  → conecta com usuário por e-mail
    Body POST: { destino_email: 'amigo@exemplo.com' }
    """
    try:
        if request.method == 'GET':
            qs = Conexao.objects.filter(origem=request.user).select_related('destino')
            return Response(ConexaoSerializer(qs, many=True).data)

        serializer = ConexaoSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            conexao = serializer.save()
            return Response(ConexaoSerializer(conexao).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception:
        return Response({'erro': 'Erro nas conexões.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def chains_remover_conexao(request, pk):
    """DELETE /api/chains/conexoes/<pk>/ → remove conexão."""
    try:
        conexao = Conexao.objects.get(pk=pk, origem=request.user)
        conexao.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    except Conexao.DoesNotExist:
        return Response({'erro': 'Conexão não encontrada.'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def chains_eventos(request):
    """GET /api/chains/eventos/ → eventos recebidos e causados."""
    try:
        recebidos = ChainEvent.objects.filter(destino=request.user).select_related('origem')
        causados  = ChainEvent.objects.filter(origem=request.user).select_related('destino')
        return Response({
            'recebidos': ChainEventSerializer(recebidos, many=True).data,
            'causados':  ChainEventSerializer(causados,  many=True).data,
        })
    except Exception:
        return Response({'erro': 'Erro ao buscar eventos.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def chains_impacto(request):
    """
    GET /api/chains/impacto/
    Retorna total de pessoas únicas beneficiadas no ano atual.
    """
    try:
        ano_atual = datetime.date.today().year
        pessoas = (
            ChainEvent.objects
            .filter(origem=request.user, data__year=ano_atual)
            .values('destino')
            .distinct()
            .count()
        )
        return Response({'pessoas_beneficiadas': pessoas, 'ano': ano_atual})
    except Exception:
        return Response({'erro': 'Erro ao calcular impacto.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
```

- [ ] **Passo 2: Commit**

```bash
git add backend/api/views.py
git commit -m "feat: add all API views (auth, progresso, missoes, badges, sentinel, chronicle, chains)"
```

---

## Task 8: Roteamento (URLs)

**Files:**
- Create: `backend/api/urls.py`
- Modify: `backend/careplus/urls.py`

- [ ] **Passo 1: Criar api/urls.py**

Conteúdo completo de `backend/api/urls.py`:
```python
"""Rotas da API CarePlus+ V2."""
from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views

urlpatterns = [
    # ── Auth ──────────────────────────────────────────────────
    path('auth/register/', views.register,            name='register'),
    path('auth/login/',    TokenObtainPairView.as_view(), name='login'),
    path('auth/refresh/',  TokenRefreshView.as_view(),    name='token_refresh'),

    # ── Usuário ────────────────────────────────────────────────
    path('usuario/', views.usuario_detail, name='usuario'),

    # ── Progresso ──────────────────────────────────────────────
    path('progresso/',            views.progresso_hoje,     name='progresso'),
    path('progresso/historico/',  views.progresso_historico, name='progresso_historico'),

    # ── Missões ────────────────────────────────────────────────
    path('missoes/', views.missoes, name='missoes'),

    # ── Badges ────────────────────────────────────────────────
    path('badges/', views.badges, name='badges'),

    # ── SENTINEL ──────────────────────────────────────────────
    path('sentinel/',        views.sentinel,             name='sentinel'),
    path('sentinel/<int:pk>/', views.sentinel_marcar_lido, name='sentinel_lido'),

    # ── Chronicle ─────────────────────────────────────────────
    path('chronicle/', views.chronicle, name='chronicle'),

    # ── Health Chains ─────────────────────────────────────────
    path('chains/conexoes/',           views.chains_conexoes,        name='chains_conexoes'),
    path('chains/conexoes/<int:pk>/',  views.chains_remover_conexao,  name='chains_remover'),
    path('chains/eventos/',            views.chains_eventos,          name='chains_eventos'),
    path('chains/impacto/',            views.chains_impacto,          name='chains_impacto'),
]
```

- [ ] **Passo 2: Atualizar careplus/urls.py**

Conteúdo completo de `backend/careplus/urls.py`:
```python
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
]
```

- [ ] **Passo 3: Verificar rotas**

```bash
python manage.py show_urls 2>/dev/null || python manage.py check
```

Saída esperada: `System check identified no issues (0 silenced).`

- [ ] **Passo 4: Commit**

```bash
git add backend/api/urls.py backend/careplus/urls.py
git commit -m "feat: configure all API URL routes"
```

---

## Task 9: Testes de integração

**Files:**
- Create: `backend/api/tests/test_auth.py`
- Create: `backend/api/tests/test_progresso.py`
- Create: `backend/api/tests/test_missoes.py`

- [ ] **Passo 1: Criar test_auth.py**

```python
"""Testes de autenticação."""
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status

Usuario = get_user_model()


class RegisterTest(APITestCase):
    def test_cadastro_cria_usuario_e_badge(self):
        """Cadastro deve criar usuário e badge 'primeiro_login'."""
        resp = self.client.post('/api/auth/register/', {
            'username': 'carol',
            'email': 'carol@test.com',
            'first_name': 'Carol',
            'password': 'senha123',
        })
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Usuario.objects.filter(username='carol').exists())
        from api.models import Badge
        self.assertTrue(Badge.objects.filter(badge_id='primeiro_login').exists())

    def test_cadastro_email_duplicado_retorna_400(self):
        """E-mail duplicado deve retornar 400."""
        Usuario.objects.create_user(username='carol', email='carol@test.com', password='senha123')
        resp = self.client.post('/api/auth/register/', {
            'username': 'carol2',
            'email': 'carol@test.com',
            'first_name': 'Carol',
            'password': 'senha123',
        })
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_retorna_tokens(self):
        """Login com credenciais corretas retorna access e refresh tokens."""
        Usuario.objects.create_user(username='carol', password='senha123')
        resp = self.client.post('/api/auth/login/', {
            'username': 'carol',
            'password': 'senha123',
        })
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn('access', resp.data)
        self.assertIn('refresh', resp.data)

    def test_endpoint_protegido_sem_token_retorna_401(self):
        """Endpoint protegido sem token deve retornar 401."""
        resp = self.client.get('/api/usuario/')
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)
```

- [ ] **Passo 2: Criar test_progresso.py**

```python
"""Testes do progresso diário."""
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status

Usuario = get_user_model()


class ProgressoTest(APITestCase):
    def setUp(self):
        self.usuario = Usuario.objects.create_user(username='carol', password='senha123')
        resp = self.client.post('/api/auth/login/', {'username': 'carol', 'password': 'senha123'})
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {resp.data['access']}")

    def test_get_progresso_hoje_sem_dados_retorna_null(self):
        resp = self.client.get('/api/progresso/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIsNone(resp.data)

    def test_post_progresso_salva_dados(self):
        resp = self.client.post('/api/progresso/', {
            'passos': 8500, 'agua': 2.5, 'sono': 7.0, 'fonte': 'Google Health'
        })
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['passos'], 8500)

    def test_agua_negativa_retorna_400(self):
        resp = self.client.post('/api/progresso/', {'passos': 0, 'agua': -1.0, 'sono': 7.0})
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
```

- [ ] **Passo 3: Criar test_missoes.py**

```python
"""Testes das missões."""
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status

Usuario = get_user_model()


class MissoesTest(APITestCase):
    def setUp(self):
        self.usuario = Usuario.objects.create_user(username='carol', password='senha123')
        resp = self.client.post('/api/auth/login/', {'username': 'carol', 'password': 'senha123'})
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {resp.data['access']}")

    def test_concluir_missao_adiciona_pontos(self):
        resp = self.client.post('/api/missoes/', {'chave_missao': 'passos'})
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(resp.data['pontos_ganhos'], 100)
        self.usuario.refresh_from_db()
        self.assertEqual(self.usuario.pontos, 100)

    def test_missao_duplicada_retorna_400(self):
        self.client.post('/api/missoes/', {'chave_missao': 'agua'})
        resp = self.client.post('/api/missoes/', {'chave_missao': 'agua'})
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_missao_invalida_retorna_400(self):
        resp = self.client.post('/api/missoes/', {'chave_missao': 'corrida'})
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_concluir_missao_cria_badge(self):
        self.client.post('/api/missoes/', {'chave_missao': 'sono'})
        from api.models import Badge
        self.assertTrue(Badge.objects.filter(usuario=self.usuario, badge_id='bom_sono').exists())
```

- [ ] **Passo 4: Rodar todos os testes**

```bash
python manage.py test api -v 2
```

Saída esperada:
```
Ran 14 tests in X.XXXs
OK
```

- [ ] **Passo 5: Commit final**

```bash
git add backend/api/tests/
git commit -m "test: add integration tests for auth, progresso, missoes"
```

---

## Task 10: Verificação final e servidor

- [ ] **Passo 1: Criar superusuário para o admin**

```bash
python manage.py createsuperuser
# Preencher: username, email, password
```

- [ ] **Passo 2: Rodar servidor**

```bash
python manage.py runserver
```

Saída esperada:
```
Starting development server at http://127.0.0.1:8000/
Quit the server with CTRL-BREAK.
```

- [ ] **Passo 3: Testar endpoint de cadastro manualmente**

```bash
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{"username":"carol","email":"carol@test.com","first_name":"Carol","password":"senha123"}'
```

Saída esperada: JSON com `id`, `username`, `email`, `pontos: 0`, `streak: 0`

- [ ] **Passo 4: Verificar admin Django**

Abrir `http://localhost:8000/admin/` → fazer login com superusuário → confirmar que todos os modelos aparecem.

- [ ] **Passo 5: Commit final do plano**

```bash
git add .
git commit -m "feat: backend foundation complete — Django API fully operational"
```

---

## Resumo das entregas

| Entrega | Satisfaz |
|---|---|
| `try-except` em todas as views e funções de detecção | ✅ CompThinking req. 1 |
| SQLite como arquivo `db.sqlite3` | ✅ CompThinking req. 2 |
| CRUD em Usuario, Progresso, Missao, Badge, Sentinel, Conexao, ChainEvent | ✅ CompThinking req. 3 |
| Views e funções documentadas com docstrings | ✅ CompThinking req. 4, 6 |
| API REST retornando JSON | ✅ WebDev req. 1 |
