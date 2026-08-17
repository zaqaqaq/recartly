import time
import pytest
import allure
import requests


# @allure.feature("API")
# @allure.story("Регистрация")
# def test_api_register():
#     """Проверка регистрации через API"""
#
#     unique_email = f"api_test_{int(time.time())}@mail.ru"
#
#     with allure.step("Отправить запрос на регистрацию"):
#         response = requests.post("http://localhost:8000/auth/register", json={
#             "email": unique_email,
#             "username": "APITestUser",
#             "password": "123456"
#         })
#
#     with allure.step("Проверить статус ответа"):
#         assert response.status_code == 200, f"Ошибка: {response.text}"
#         assert "id" in response.json()
#
#
# @allure.feature("API")
# @allure.story("авторизация")
# def test_api_login():
#     """Проверка входа через API"""
#     with allure.step("Отправляем запрос на авторизацию"):
#         response = requests.post("http://localhost:8000/auth/login", json={
#             "email": "12334@gmail.com",
#             "password": "123456"
#         })
#
#     with allure.step("Проверка авторизации"):
#         assert response.status_code == 200
#
#     with allure.step("Проверка токена"):
#         assert "access_token" in response.json()
#         assert response.json()["access_token"]

def test_api_get_profile():
    """Проверка получения профиля"""
    pass