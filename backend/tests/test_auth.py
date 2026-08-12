import allure
from ..pages.login_page import LoginPage


def test_negative_auth(page):
    """Ввод неверных данных"""
    login_page = LoginPage(page)
    login_page.navigate()
    login_page.login("zxcmode@zxc.ru", "22222")

    assert page.locator('text="Ошибка входа. Проверьте email и пароль"').is_visible()


def test_positiv_auth(page):
    """Вход с валидными данными - ОТЛАДКА"""
    login_page = LoginPage(page)
    login_page.navigate()
    login_page.registration_positive("test3@mail.ru", "Тестик3", "123456")
    login_page.login("1@test.ru", "1234567")

    # 1. Ждем 3 секунды, чтобы все точно прогрузилось
    page.wait_for_timeout(3000)

    # 5. Проверяем, что вошли
    assert page.locator('text=Den4ik').first.is_visible()

def test_logout(page):
    """Вход и выход"""
    login_page = LoginPage(page)
    login_page.navigate()
    login_page.registration_positive("test22@mail.ru", "Тестик22", "123456")
    login_page.login("1@test.ru", "1234567")
    assert page.locator('text="Den4ik"').first.is_visible()
    login_page.logout()

def test_registration_positive(page):
    """Проверка валидной регистрации"""
    login_page = LoginPage(page)
    login_page.navigate()
    login_page.registration_positive("test33@mail.ru", "Тестик33","123456")

