import allure


def test_negative_data_auth(page):
    """ввод неверных данных"""
    page.locator('text=Войти').first.click()
    page.fill('input[type="email"]', 'zxcmode@zxc.ru')
    page.fill('input[type="password"]', '22222')
    page.click('.btn-primary')
    assert page.locator('text="Ошибка входа. Проверьте email и пароль"').is_visible()

@allure.feature("Авторизация")
@allure.story("Успешный вход")
@allure.severity(allure.severity_level.CRITICAL)
def test_positiv_auth(page):
    """Вход с валидными данными"""
    page.locator('text="Войти"').first.click()
    page.fill('.input','1@test.ru')
    page.fill('input[type="password"]','1234567')
    page.click('.btn-primary')
    assert page.url == "http://localhost:3000/"

def test_logout(page):
    """проверка входа и выхода из системы"""
    page.locator('text="Войти"').first.click()
    page.fill('.input','1@test.ru')
    page.fill('input[type="password"]','1234567')
    page.click('.btn-primary')
    page.locator('text=Den4ik').click()
    page.click('.btn-danger')
    assert page.locator('a:has-text("Войти")')

def test_registration_positive(page):
    """Регистрация пользователя"""
    page.locator('text="Войти"').first.click()
    page.click('text="Зарегистрируйтесь"')
    page.fill('input[type="email"]', 'dsff@mail.ru')
    page.fill('input[type="password"]', '123456')
    page.locator('input[type="text"]').nth(1).fill('Оывв')
    page.locator('text="Зарегистрироваться"').click()


