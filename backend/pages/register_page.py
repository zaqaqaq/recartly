class RegisterPage:
    def __init__(self, page):
        self.page = page
        self.register_link = 'a:has-text("Зарегистрируйтесь")'
        self.email_input = 'input[type="email"]'
        self.password_input = 'input[type="password"]'
        self.username_input = 'input[type="text"]'  # все поля text
        self.submit_button = 'button:has-text("Зарегистрироваться")'

    def navigate(self):
        self.page.goto("http://localhost:3000/login")
        self.page.locator(self.register_link).click()
        # Ждем загрузки формы
        self.page.wait_for_timeout(500)

    def register(self, email, password, username):
        # Очищаем поля перед заполнением
        self.page.locator(self.email_input).fill(email)
        self.page.locator(self.password_input).fill(password)
        # Берем второе поле type="text" (индекс 1)
        self.page.locator(self.username_input).nth(1).fill(username)
        # Кликаем по кнопке
        self.page.locator(self.submit_button).click()