# import allure
# from ..pages.login_page import LoginPage
# from ..pages.main_page import MainPage
# from ..pages.register_page import RegisterPage
# import time
#
#
# def test_negative_auth(page):
#     """Ввод неверных данных"""
#     login_page = LoginPage(page)
#     login_page.navigate()
#     login_page.login("zxcmode@zxc.ru", "22222")
#
#     assert page.locator('text="Ошибка входа. Проверьте email и пароль"').is_visible()
#
#
# def test_positiv_auth(page):
#     """Вход с валидными данными (CI-ready)"""
#
#     unique_email = f"ci_user_{int(time.time())}@mail.ru"
#     PASSWORD = 'Test123456'
#     USERNAME = 'TestUser'
#
#     print(f"🔍 Регистрируем: {unique_email}")
#
#     # 1. Регистрация
#     register_page = RegisterPage(page)
#     register_page.navigate()
#
#     # 2. Заполняем поля
#     page.fill('input[type="email"]', unique_email)
#     page.fill('input[type="password"]', PASSWORD)
#     page.locator('input[type="text"]').nth(1).fill(USERNAME)
#
#     # 🔍 Проверяем, что поля действительно заполнились
#     print("Email в поле:", page.locator('input[type="email"]').input_value())
#     print("Имя в поле:", page.locator('input[type="text"]').nth(1).input_value())
#
#     # 🔍 Даем время на валидацию формы
#     page.wait_for_timeout(1000)
#
#     # 3. Нажимаем кнопку (force=True — работает в CI!)
#     page.locator('button:has-text("Зарегистрироваться")').click(force=True)
#
#     # 4. Ждем результат
#     page.wait_for_timeout(2000)
#     print("URL после регистрации:", page.url)
#
#     assert "login" in page.url, "Регистрация не удалась"
#
# def test_logout(page):
#     """Вход и выход"""
#
#     EMAIL = 'test_register@mail.ru'
#     PASSWORD = 'Test123456'
#     USERNAME = 'TestUser'
#
#     # 1. Регистрация
#     register_page = RegisterPage(page)
#     register_page.navigate()
#     register_page.register(EMAIL, PASSWORD, USERNAME)
#
#     # 2. Вход
#     login_page = LoginPage(page)
#     login_page.navigate()
#     login_page.login(EMAIL, PASSWORD)
#
#     # 3. Проверка входа
#     main_page = MainPage(page)
#     assert main_page.is_logged_in(), "Не удалось войти"
#
#     # 4. Выход
#     main_page.logout()
#
#     # 5. Проверка выхода
#     assert main_page.is_logged_out(), "Не удалось выйти"
#
# def test_registration_positive(page):
#     """Проверка валидной регистрации"""
#     register_page = RegisterPage(page)
#     login_page = LoginPage(page)
#     login_page.navigate()
#     register_page.navigate()  # ← переходим на регистрацию
#     register_page.register("new_user@mail.ru", "NewPass123", "NewUser")  # ← используем метод register()




