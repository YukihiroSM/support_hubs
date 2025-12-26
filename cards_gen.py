from PIL import Image, ImageDraw, ImageFont
from pathlib import Path

# =========================
# НАЛАШТУВАННЯ
# =========================

BACKGROUND_PATH = "background.png"
QR_DIR = Path("qr")
OUTPUT_DIR = Path("output")

FONT_PATH = "fonts/Unbounded-VariableFont_wght.ttf"

START = 1
END = 15

OUTPUT_DIR.mkdir(exist_ok=True)

# A6 @ 300 DPI
CANVAS_SIZE = (1240, 1748)

HEADER_TEXT = "SUPPORT HUB"
DEFAULT_TITLE = "РАЗОМ"
DEFAULT_SUBTEXT = "30 секунд для себе"

CARD_TEXTS = {
    "001": ("ТИХОГО РІЗДВА", "і ясної дороги"),
    "002": ("СВІТЛИХ СВЯТ", "у словах і тиші"),
    "003": ("МИРНОГО РІЗДВА", "і спокійного серця"),
    "004": ("РІЗДВА ЗЛАГОДИ", "і теплих слів"),
    "005": ("РІЗДВА СВІТЛА", "у простих речах"),
    "006": ("РІЗДВЯНОЇ ТИШІ", "для відновлення"),
    "007": ("СВЯТОЇ ПАУЗИ", "для себе"),
    "008": ("СВІТЛОЇ ОПОРИ", "на кожен день"),
    "009": ("ТИХОГО РИТМУ", "крок за кроком"),
    "010": ("СВІТЛО ПОРУЧ", "м’яко й повільно"),
    "011": ("РІЗДВА ДОВІРИ", "ми поруч"),
    "012": ("РІЗДВА СПІЛЬНОСТІ", "ти не сам(а)"),
    "013": ("РІЗДВА ПОЛЕГШЕННЯ", "день за днем"),
    "014": ("РІЗДВА ДОСТАТКУ", "саме стільки"),
    "015": ("РІЗДВА ТЕПЛА", "для видиху"),
}

TEXT_COLOR = (20, 25, 20)

# =========================
# ШРИФТИ
# =========================

def font(size, weight=700):
    font_obj = ImageFont.truetype(FONT_PATH, size)
    try:
        axes = font_obj.get_variation_axes()
        axis_index = {axis["tag"]: idx for idx, axis in enumerate(axes)}
        if "wght" in axis_index:
            coords = [axis["default"] for axis in axes]
            wght_axis = axes[axis_index["wght"]]
            weight = max(wght_axis["min"], min(weight, wght_axis["max"]))
            coords[axis_index["wght"]] = weight
            font_obj.set_variation_by_axes(coords)
    except Exception:
        pass
    return font_obj

# =========================
# КОМПОЗИЦІЯ
# =========================

def compose_card(hub_code: str):
    bg = Image.open(BACKGROUND_PATH).convert("RGB").resize(CANVAS_SIZE)
    draw = ImageDraw.Draw(bg)

    # Шрифти
    font_header = font(38, weight=700)
    font_title = font(80, weight=700)     # великий, виглядає як Bold
    font_sub = font(40, weight=700)

    # --- Header ---
    draw.text(
        (CANVAS_SIZE[0] // 2, 320),
        f"{HEADER_TEXT} | {hub_code}",
        fill=TEXT_COLOR,
        font=font_header,
        anchor="mm"
    )

    # --- QR ---
    qr_path = QR_DIR / f"hub_{hub_code}.png"
    if not qr_path.exists():
        print(f"⚠ QR не знайдено: {qr_path.name}")
        return

    qr = Image.open(qr_path).convert("RGBA")
    qr_size = 420
    qr = qr.resize((qr_size, qr_size), Image.LANCZOS)

    bg.paste(
        qr,
        ((CANVAS_SIZE[0] - qr_size) // 2, 390),
        qr
    )

    title_text, subtext = CARD_TEXTS.get(hub_code, (DEFAULT_TITLE, DEFAULT_SUBTEXT))

    # --- Title ---
    draw.text(
        (CANVAS_SIZE[0] // 2, 930),
        title_text,
        fill=TEXT_COLOR,
        font=font_title,
        anchor="mm"
    )

    # --- Subtext ---
    draw.text(
        (CANVAS_SIZE[0] // 2, 1020),
        subtext,
        fill=TEXT_COLOR,
        font=font_sub,
        anchor="mm"
    )

    # --- Save ---
    out = OUTPUT_DIR / f"card_{hub_code}.png"
    bg.save(out, dpi=(300, 300))
    print(f"✓ {out.name}")

# =========================
# ЗАПУСК
# =========================

if __name__ == "__main__":
    for i in range(START, END + 1):
        compose_card(f"{i:03d}")
