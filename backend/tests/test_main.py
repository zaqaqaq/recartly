def test_main_opens(page):
    """Проверка открытия главной страницы"""
    assert page.locator('text="Готовьте с умом, экономьте с нами"').is_visible()

def test_auth_main(page):
    """Проверка кнопки войти"""
    page.locator('text=Войти').first.click()

