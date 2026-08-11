import pytest
import sys
import os

# Добавляем корневую папку в путь (чтобы импортировать utils)
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