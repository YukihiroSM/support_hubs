from __future__ import annotations

from typing import Dict, List, Optional

HUBS: List[Dict[str, object]] = [
    {
        "id": "001",
        "kind": "container",
        "title": "Хаб 001",
        "lead": "",
        "short_label": "контейнер",
        "brand_label": "РІЙ · Хаб 001",
        "show_footer": False,
        "template": "hubs/hub_001.html",
        "index_title": "Контейнер",
        "index_description": (
            "Місце, де слова існують лише поки ти дивишся. "
            "Пишеш — і воно тихо розсипається, залишаючи порожнечу замість ваги."
        ),
        "placeholder": "Пиши тут.",
        "button_label": "ВІДПУСТИТИ",
        "after_primary": "Це все, ти це відпустив(ла).",
        "after_secondary": "",
        "fade_start_ms": 3500,
        "fade_end_ms": 12000,
        "delete_after_ms": 12000,
        "delete_interval_ms": 2600,
        "release_duration_ms": 650,
    },
    {
        "id": "002",
        "kind": "shards",
        "title": "Сказати без формулювань",
        "lead": "",
        "short_label": "осколки",
        "brand_label": "РІЙ · Хаб 002",
        "show_footer": False,
        "template": "hubs/hub_002.html",
        "index_title": "Слова-осколки",
        "index_description": (
            "Фрази не потрібні. Тут залишаються лише фрагменти — "
            "короткі слова, що дрейфують і повільно тануть."
        ),
        "placeholder": "",
        "hint_line": "Можна не складати речення.",
        "after_lines": ["Слова пішли.", "[ пауза ]", "Можеш закрити сторінку."],
        "overload_threshold": 22,
        "max_words": 70,
        "word_duration_s": 12,
        "release_duration_ms": 600,
    },
    {
        "id": "003",
        "kind": "rage",
        "title": "Злість / Розряд",
        "lead": "",
        "short_label": "розряд",
        "brand_label": "РІЙ · Хаб 003",
        "show_footer": False,
        "template": "hubs/hub_003.html",
        "index_title": "Розряд",
        "index_description": (
            "Натискання без сенсу, але з силою. "
            "Символи спалахують і гаснуть, залишаючи місце тиші."
        ),
        "hint_line": "Можна бути різким.",
        "after_lines": ["Розряд відбувся.", "Можеш закрити сторінку і рухатись далі."],
        "idle_timeout_ms": 3600,
        "overload_threshold": 13,
        "symbol_duration_min_ms": 480,
        "symbol_duration_max_ms": 1400,
        "blast_count": 100,
        "blast_duration_ms": 520,
        "overload_text": "Ти впораєшся, ти молодець.",
        "exhale_text": "Видихай.",
        "exhale_delay_ms": 320,
    },
    {
        "id": "004",
        "kind": "argument",
        "title": "Посваритись",
        "lead": "",
        "short_label": "сварка",
        "brand_label": "РІЙ · Хаб 004",
        "show_footer": False,
        "template": "hubs/hub_004.html",
        "index_title": "Контрольований конфлікт",
        "index_description": (
            "Різкі слова без адресата. Ти говориш — і отримуєш холодну, "
            "коротку відповідь, що зупиняє розкрутку."
        ),
        "hint_line": "Можна не бути правим.",
        "after_lines": ["Сварка закінчилась.", "Нічого не залишилось. Ти молодець!"],
        "responses": ["Я почув.", "Це прийнято.", "Добре.", "Зрозуміло."],
        "idle_timeout_ms": 5200,
        "reply_delay_min_ms": 1000,
        "reply_delay_max_ms": 1900,
        "escalation_window_ms": 7000,
        "escalation_threshold": 4,
    },
    {
        "id": "005",
        "kind": "light",
        "title": "Щось добре сьогодні",
        "lead": "",
        "short_label": "світло",
        "brand_label": "РІЙ · Хаб 005",
        "show_footer": False,
        "template": "hubs/hub_005.html",
        "index_title": "Світла думка",
        "index_description": (
            "Одна маленька добра річ змінює простір. "
            "Вона не має бути великою, достатньо простої."
        ),
        "prompt_line": "Що сьогодні було доброго?",
        "affirmation_line": "Це важливо.",
        "after_lines": ["Можеш забрати це з собою."],
        "idle_timeout_ms": 2400,
        "after_delay_ms": 4200,
        "min_chars": 40,
    },
    {
        "id": "006",
        "kind": "silence",
        "title": "Тиша",
        "lead": "",
        "short_label": "тиша",
        "brand_label": "РІЙ · Хаб 006",
        "show_footer": False,
        "template": "hubs/hub_006.html",
        "index_title": "Тиша",
        "index_description": "Сторінка, де нічого не відбувається. Можеш просто побути.",
    },
    {
        "id": "007",
        "kind": "silence",
        "title": "30 секунд",
        "lead": "",
        "short_label": "пауза",
        "brand_label": "РІЙ · Хаб 007",
        "show_footer": False,
        "template": "hubs/hub_007.html",
        "index_title": "30 секунд",
        "index_description": "Коротка офіційна пауза без вимог. Просто час.",
    },
    {
        "id": "008",
        "kind": "silence",
        "title": "Одна точка",
        "lead": "",
        "short_label": "точка",
        "brand_label": "РІЙ · Хаб 008",
        "show_footer": False,
        "template": "hubs/hub_008.html",
        "index_title": "Одна точка",
        "index_description": "Невелика точка, за якою можна просто спостерігати.",
    },
    {
        "id": "009",
        "kind": "silence",
        "title": "Ритм",
        "lead": "",
        "short_label": "ритм",
        "brand_label": "РІЙ · Хаб 009",
        "show_footer": False,
        "template": "hubs/hub_009.html",
        "index_title": "Ритм",
        "index_description": "Повільна форма, що розширюється і стискається.",
    },
    {
        "id": "010",
        "kind": "silence",
        "title": "Світло",
        "lead": "",
        "short_label": "світло",
        "brand_label": "РІЙ · Хаб 010",
        "show_footer": False,
        "template": "hubs/hub_010.html",
        "index_title": "Світло",
        "index_description": "Плавне повернення світла без поспіху.",
    },
    {
        "id": "011",
        "kind": "warm",
        "title": "Ти ок",
        "lead": "",
        "short_label": "ти ок",
        "brand_label": "РІЙ · Хаб 011",
        "show_footer": False,
        "template": "hubs/hub_011.html",
        "index_title": "Ти ок",
        "index_description": "Короткі фрази, що знімають напругу без тиску.",
    },
    {
        "id": "012",
        "kind": "warm",
        "title": "Серед людей",
        "lead": "",
        "short_label": "люди",
        "brand_label": "РІЙ · Хаб 012",
        "show_footer": False,
        "template": "hubs/hub_012.html",
        "index_title": "Серед людей",
        "index_description": "Повільний натовп точок, які просто існують поруч.",
    },
    {
        "id": "013",
        "kind": "warm",
        "title": "Вага",
        "lead": "",
        "short_label": "вага",
        "brand_label": "РІЙ · Хаб 013",
        "show_footer": False,
        "template": "hubs/hub_013.html",
        "index_title": "Вага",
        "index_description": "Екран відчувається важким, коли ти рухаєшся.",
    },
    {
        "id": "014",
        "kind": "warm",
        "title": "Достатньо",
        "lead": "",
        "short_label": "достатньо",
        "brand_label": "РІЙ · Хаб 014",
        "show_footer": False,
        "template": "hubs/hub_014.html",
        "index_title": "Достатньо",
        "index_description": "Міра без цілі: наповнення зупиняється на межі.",
    },
    {
        "id": "015",
        "kind": "warm",
        "title": "Хмаринка",
        "lead": "",
        "short_label": "хмаринка",
        "brand_label": "РІЙ · Хаб 015",
        "show_footer": False,
        "template": "hubs/hub_015.html",
        "index_title": "Хмаринка",
        "index_description": "М’яка абстрактна форма, що повільно пливе і дихає.",
    },
]
HUBS_BY_ID: Dict[str, Dict[str, object]] = {hub["id"]: hub for hub in HUBS}


def normalize_page_id(page_id: str) -> Optional[str]:
    normalized = page_id.strip()
    if normalized.isdigit():
        return normalized.zfill(2)
    return None


def get_hub(page_id: str) -> Optional[Dict[str, object]]:
    normalized = normalize_page_id(page_id)
    if not normalized:
        return None
    return HUBS_BY_ID.get(normalized)
