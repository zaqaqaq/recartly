import allure
from ..pages.login_page import LoginPage
from ..pages.main_page import MainPage
from ..pages.register_page import RegisterPage


def test_negative_auth(page):
    """Ввод неверных данных"""
    login_page = LoginPage(page)
    login_page.navigate()
    login_page.login("zxcmode@zxc.ru", "22222")

    assert page.locator('text="Ошибка входа. Проверьте email и пароль"').is_visible()


def test_positiv_auth(page):
    """Вход с валидными данными (CI-ready)"""

    EMAIL = 'test_register@mail.ru'
    PASSWORD = 'Test123456'
    USERNAME = 'TestUser'

    # 1. Регистрация
    register_page = RegisterPage(page)
    register_page.navigate()
    register_page.register(EMAIL, PASSWORD, USERNAME)

    # 2. Переход на логин
    login_page = LoginPage(page)
    login_page.navigate()

    # 🔍 ОТЛАДКА: проверяем, что мы на странице логина
    print("1. Текущий URL:", page.url)

    # 3. Вход
    login_page.login(EMAIL, PASSWORD)

    # 🔍 ОТЛАДКА: что после клика?
    page.wait_for_timeout(2000)
    print("2. URL после входа:", page.url)
    print("3. Текст страницы:", page.locator('body').inner_text()[:500])

    # 4. Проверка
    main_page = MainPage(page)
    assert main_page.is_logged_in(), "Не удалось войти"


def test_logout(page):
    """Вход и выход"""

    EMAIL = 'test_register@mail.ru'
    PASSWORD = 'Test123456'
    USERNAME = 'TestUser'

    # 1. Регистрация
    register_page = RegisterPage(page)
    register_page.navigate()
    register_page.register(EMAIL, PASSWORD, USERNAME)

    # 2. Вход
    login_page = LoginPage(page)
    login_page.navigate()
    login_page.login(EMAIL, PASSWORD)

    # 3. Проверка входа
    main_page = MainPage(page)
    assert main_page.is_logged_in(), "Не удалось войти"

    # 4. Выход
    main_page.logout()

    # 5. Проверка выхода
    assert main_page.is_logged_out(), "Не удалось выйти"

def test_registration_positive(page):
    """Проверка валидной регистрации"""
    register_page = RegisterPage(page)
    login_page = LoginPage(page)
    login_page.navigate()
    register_page.navigate()  # ← переходим на регистрацию
    register_page.register("new_user@mail.ru", "NewPass123", "NewUser")  # ← используем метод register()

