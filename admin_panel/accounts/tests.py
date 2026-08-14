from rest_framework.test import APITestCase
from rest_framework import status

from accounts.models import User


class LoginTest(APITestCase):

    def setUp(self):
        User.objects.create_user(
            email="abh.mrya@gmail.com",
            password="abh.mrya",
            username = "abh.mrya",
            first_name = "abh.mrya"
        )

    def test_login_with_valid_credentials(self):
        response = self.client.post(
            "/api/v1/auth/login/",
            {
                "email": "abh.mrya@gmail.com",
                "password": "abh.mrya",
            },
        )

        print(response.data)

        self.assertEqual(response.status_code, status.HTTP_200_OK)