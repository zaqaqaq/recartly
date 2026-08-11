# utils/data_loader.py
import json
import os


def load_json(file_path):
    """Универсальная функция загрузки JSON"""
    base_dir = os.path.dirname(os.path.dirname(__file__))
    full_path = os.path.join(base_dir, file_path)

    with open(full_path, 'r', encoding='utf-8') as f:
        return json.load(f)


def load_config():
    return load_json('config/config.json')


def load_test_data():
    return load_json('test_data/test_data.json')