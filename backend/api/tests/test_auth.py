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
