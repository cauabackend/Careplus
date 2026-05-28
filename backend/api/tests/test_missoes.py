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
