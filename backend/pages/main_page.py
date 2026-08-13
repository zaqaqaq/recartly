class MainPage:
    """Class для главной страницы"""
    def __init__(self, page):
            self.page = page
            self.main_opens = 'text="Готовьте с умом, экономьте с нами"'
            self.auth_button = 'text=Войти'

    def main_open(self):
        """Отрытие главной страницы"""
        self.page.locator(self.main_opens).is_visible()


    def auth_main(self):
        """Проверка страницы авторизации"""
        self.page.locator(self.auth_button).first.click()