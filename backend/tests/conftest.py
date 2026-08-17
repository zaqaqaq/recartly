import pytest
import sys
import os
import pytest
import psycopg2

# Добавляем backend в путь (чтобы импортировать pages)
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from playwright.sync_api import sync_playwright
from utils.data_loader import load_json

@pytest.fixture
def config():
    """Загружает конфиг из config/config.json"""
    return load_json('config/config.json')


# Определяем, запущены ли тесты в CI (GitHub Actions)
IS_CI = os.getenv("CI") == "true"

@pytest.fixture
def page(config):
    with sync_playwright() as p:
        # В CI — headless, локально — с браузером
        browser = p.chromium.launch(headless=IS_CI, slow_mo=300)
        page = browser.new_page()
        page.goto(config["base_url"])
        yield page
        browser.close()


@pytest.fixture(autouse=True)
def clear_db():
    """Очищает базу данных перед каждым тестом"""
    try:
        # Подключение к БД
        conn = psycopg2.connect(
            dbname="recartly",
            user="recartly",
            password="recartly123",
            host="localhost",
            port="5432"
        )
        cursor = conn.cursor()

        # Очищаем только существующие таблицы
        cursor.execute("DELETE FROM users WHERE email LIKE '%@mail.ru';")
        cursor.execute("DELETE FROM recipes WHERE title LIKE 'ci_%';")

        conn.commit()
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"⚠️ Ошибка очистки БД: {e}")

    yield