class MainPage:
    def __init__(self, page):
        self.page = page
        self.username = 'text=TestUser'  # Имя пользователя
        self.logout_button = 'text=🚪 Выйти'  # ← исправлено!
        self.login_link = 'text=Войти'

    def is_logged_in(self):
        return self.page.locator(self.username).first.is_visible()

    def logout(self):
        # 1. Кликаем по имени, чтобы открыть меню
        self.page.locator(self.username).first.click()

        # 2. Ждем, пока меню откроется
        self.page.wait_for_timeout(500)

        # 3. Кликаем по кнопке "🚪 Выйти"
        self.page.locator(self.logout_button).click()

    def is_logged_out(self):
        return self.page.locator(self.login_link).first.is_visible()