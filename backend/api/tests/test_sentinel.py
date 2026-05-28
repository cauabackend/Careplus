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
    """Helper: cria ProgressoDiario com data relativa a hoje.

    Como data usa auto_now_add, usamos raw SQL via connection.cursor()
    para inserir o registro com a data desejada sem acionar o auto_now_add.
    """
    from api.models import ProgressoDiario
    from django.db import connection
    data = datetime.date.today() - datetime.timedelta(days=dias_atras)
    with connection.cursor() as cursor:
        cursor.execute(
            """
            INSERT INTO api_progressodiario (usuario_id, data, passos, agua, sono, fonte)
            VALUES (%s, %s, %s, %s, %s, %s)
            """,
            [usuario.pk, data.isoformat(), passos, agua, sono, 'Test'],
        )
        obj_id = cursor.lastrowid
    return ProgressoDiario.objects.get(pk=obj_id)


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
