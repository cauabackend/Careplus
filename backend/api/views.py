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
