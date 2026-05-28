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
