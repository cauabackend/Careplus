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
