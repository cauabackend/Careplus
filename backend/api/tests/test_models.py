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
