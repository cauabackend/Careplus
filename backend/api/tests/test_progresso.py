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
