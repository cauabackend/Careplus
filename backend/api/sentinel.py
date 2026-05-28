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
