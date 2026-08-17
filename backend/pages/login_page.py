class LoginPage:
    def __init__(self, page):
        self.page = page
        self.login_link = 'a:has-text("Войти")'  # ← кнопка в шапке
        self.email_input = 'input[type="email"]'  # ← поле email
        self.password_input = 'input[type="password"]'  # ← поле пароля
        self.submit_button = '.btn-primary'  # ← кнопка "Войти" на форме

    def navigate(self):
        self.page.locator(self.login_link).first.click()

    def login(self, email, password):
        self.page.fill(self.email_input, email)
        self.page.fill(self.password_input, password)
        self.page.click(self.submit_button)


