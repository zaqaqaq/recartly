class RegisterPage:
    def __init__(self, page):
        self.page = page
        self.register_link = 'a:has-text("Зарегистрируйтесь")'
        self.email_input = 'input[type="email"]'
        self.password_input = 'input[type="password"]'
        self.username_input = 'input[type="text"]'
        self.submit_button = 'button:has-text("Зарегистрироваться")'

    def navigate(self):
        """Переход на страницу регистрации через логин"""
        # 1. Сначала открываем главную
        self.page.goto("http://localhost:3000")

        # 2. Кликаем на "Войти" (чтобы попасть на /login)
        self.page.locator('a:has-text("Войти")').first.click()

        # 3. Ждем, когда появится ссылка "Зарегистрируйтесь"
        self.page.wait_for_selector(self.register_link, state="visible", timeout=5000)

        # 4. Кликаем на "Зарегистрируйтесь"
        self.page.locator(self.register_link).click()

    def register(self, email, password, username):
        self.page.fill(self.email_input, email)
        self.page.fill(self.password_input, password)
        self.page.locator(self.username_input).nth(1).fill(username)
        self.page.locator(self.submit_button).click()