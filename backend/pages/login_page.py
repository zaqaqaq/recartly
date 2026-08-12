class LoginPage:
    """Класс для работы со страницей входа"""
    def __init__(self, page):
        """При создании объекта запоминаем page и селекторы"""
        self.page = page
        self.login_link = 'text="Войти"'
        self.email_input = '.input'
        self.password_input_reg_auth = 'input[type="password"]'
        self.submit_button = '.btn-primary'
        self.fist_name = 'text="Den4ik"'
        self.exit_button = '.btn-danger'
        self.registration_button = 'text="Зарегистрируйтесь"'
        self.name_registration = 'input[type="text"]'
        self.email_registration = 'input[type="email"]'
        self.form_registration_button = 'text="Зарегистрироваться"'

    def navigate(self):
        """Открывает страницу логина (клик по 'Войти')"""
        self.page.locator(self.login_link).first.click()

    def login(self,email,password):
        """Выполняет вход с указанными email и паролем"""
        self.page.fill(self.email_input, email)
        self.page.fill(self.password_input_reg_auth, password)
        self.page.click(self.submit_button)

    def logout(self):
        """Выход из учетной записи"""
        self.page.locator(self.fist_name).first.click()
        self.page.locator(self.exit_button).first.click()
        assert self.page.locator(self.login_link).first.is_visible()

    def registration_positive(self,email, name, password):
        """регистрация с валидными данными"""
        self.page.locator(self.registration_button).first.click()
        self.page.fill(self.email_registration, email)
        self.page.locator(self.name_registration).last.fill(name)
        self.page.fill(self.password_input_reg_auth, password)
        self.page.locator(self.form_registration_button).first.click()

