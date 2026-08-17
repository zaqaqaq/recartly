from playwright.sync_api import sync_playwright
import time

def test_open_page():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False, slow_mo=500)
        page = browser.new_page()
        page.goto("http://localhost:3000")

        # Просто смотрим, что открылось
        print("✅ Страница открыта")
        print(f"URL: {page.url}")
        print(f"Заголовок: {page.title()}")

        browser.close()

def test_main_text(page):
    page.goto("http://localhost:3000")
    text = page.locator('body').inner_text()
    print("📝 Весь текст на странице:")
    print(text[:500])  # первые 500 символов
    assert "Готовьте" in text, "Текст не найден"


def test_login_button(page):
    page.goto("http://localhost:3000")

    # Ищем любую ссылку с текстом "Войти"
    buttons = page.locator('a:has-text("Войти")').all()
    print(f"🔍 Найдено кнопок 'Войти': {len(buttons)}")

    for i, btn in enumerate(buttons):
        print(f"  {i}: {btn.inner_text()} -> href={btn.get_attribute('href')}")

    assert len(buttons) > 0, "Кнопка 'Войти' не найдена"


def test_click_login(page):
    page.goto("http://localhost:3000")

    # Кликаем по первой кнопке "Войти"
    page.locator('a:has-text("Войти")').first.click()

    # Ждем, когда появится поле email
    page.wait_for_selector('input[type="email"]', timeout=5000)
    assert page.locator('input[type="email"]').is_visible(), "Поле email не появилось"

    print("✅ Страница логина открыта")


def test_register_only(page):
    """Проверяем только регистрацию"""
    unique_email = f"test_{int(time.time())}@mail.ru"

    page.goto("http://localhost:3000/login")
    page.locator('a:has-text("Зарегистрируйтесь")').click()
    page.fill('input[type="email"]', unique_email)
    page.fill('input[type="password"]', 'Test123456')
    page.locator('input[type="text"]').nth(1).fill('TestUser')
    page.locator('button:has-text("Зарегистрироваться")').click()

    page.wait_for_timeout(2000)
    assert "login" in page.url, "Регистрация не удалась"


def test_logout_button_exists(page):
    """Проверяем, есть ли кнопка 'Выйти'"""
    page.goto("http://localhost:3000")

    # 1. Кликаем по имени пользователя (если он уже залогинен)
    # Или сначала логинимся
    page.locator('a:has-text("Войти")').first.click()
    page.fill('input[type="email"]', 'test_register@mail.ru')
    page.fill('input[type="password"]', 'Test123456')
    page.click('.btn-primary')

    # 2. Ждем, пока страница загрузится
    page.wait_for_timeout(1000)

    # 3. Кликаем по имени пользователя (открываем меню)
    page.locator('text=TestUser').first.click()
    page.wait_for_timeout(500)

    # 4. Проверяем, есть ли кнопка "Выйти"
    logout_buttons = page.locator('text=Выйти').all()
    print(f"🔍 Найдено кнопок 'Выйти': {len(logout_buttons)}")
    for i, btn in enumerate(logout_buttons):
        print(f"  {i}: {btn.inner_text()}")

    assert len(logout_buttons) > 0, "Кнопка 'Выйти' не найдена"


def test_register_debug(page):
    """Отладка регистрации"""

    unique_email = f"debug_{int(time.time())}@mail.ru"
    print(f"🔍 Регистрируем: {unique_email}")

    # 1. Переход на регистрацию
    page.goto("http://localhost:3000/login")
    page.locator('a:has-text("Зарегистрируйтесь")').click()

    # 2. Заполняем форму
    page.fill('input[type="email"]', unique_email)
    page.fill('input[type="password"]', 'Test123456')
    page.locator('input[type="text"]').nth(1).fill('TestUser')

    # 3. Нажимаем кнопку
    page.locator('button:has-text("Зарегистрироваться")').click()

    # 4. Ждем и проверяем
    page.wait_for_timeout(2000)
    print("URL после регистрации:", page.url)
    print("Текст страницы:", page.locator('body').inner_text()[:500])

    assert "login" in page.url, "Регистрация не удалась"


def test_register_selector_debug(page):
    """Находит все поля на странице регистрации"""
    page.goto("http://localhost:3000/login")
    page.locator('a:has-text("Зарегистрируйтесь")').click()

    # Ждем загрузки формы
    page.wait_for_timeout(1000)

    # Находим все поля ввода
    inputs = page.locator('input').all()
    print(f"🔍 Найдено полей ввода: {len(inputs)}")

    for i, inp in enumerate(inputs):
        print(
            f"  {i}: type={inp.get_attribute('type')}, name={inp.get_attribute('name')}, id={inp.get_attribute('id')}")

    # Находим все кнопки
    buttons = page.locator('button').all()
    print(f"🔍 Найдено кнопок: {len(buttons)}")
    for i, btn in enumerate(buttons):
        print(f"  {i}: text={btn.inner_text()}, type={btn.get_attribute('type')}")