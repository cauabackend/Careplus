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
