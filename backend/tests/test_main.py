from backend.pages.login_page import LoginPage
from backend.pages.main_page import MainPage


def test_main_opens(page):
    """Проверка открытия главной страницы"""
    main_page = MainPage(page)
    login_page = LoginPage(page)
    login_page.navigate()
    login_page.login("1@test.ru", "1234567")
    main_page.main_open()

def test_auth_main(page):
    """Проверка кнопки войти"""
    main_page = MainPage(page)
    main_page.auth_main()

