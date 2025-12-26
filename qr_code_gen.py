import qrcode
from qrcode.constants import ERROR_CORRECT_H
from PIL import Image
from pathlib import Path

# =========================
# НАЛАШТУВАННЯ
# =========================

BASE_URL = "https://support-hubs.yuk0-dev-team.pp.ua/hub/{hub}"
START = 1
END = 50

OUTPUT_DIR = Path("output")
OUTPUT_DIR.mkdir(exist_ok=True)

USE_LOGO = False            # False, якщо не треба логотип
LOGO_PATH = "logo.png"     # PNG з прозорістю
LOGO_SCALE = 0.22          # 22% від розміру QR (безпечний максимум)

QR_COLOR = "#0e2f16"       # темний (чорний/хакі)
BG_COLOR = "#f5f5f0"       # світлий фон (для друку)

# =========================
# ФУНКЦІЇ
# =========================

def generate_qr(hub_code: str):
    url = BASE_URL.format(hub=hub_code)

    qr = qrcode.QRCode(
        version=None,  # автоматичний розмір
        error_correction=ERROR_CORRECT_H,
        box_size=12,   # впливає на фізичний розмір
        border=4,      # стандарт для сканерів
    )

    qr.add_data(url)
    qr.make(fit=True)

    img = qr.make_image(
        fill_color=QR_COLOR,
        back_color=BG_COLOR
    ).convert("RGB")

    if USE_LOGO and Path(LOGO_PATH).exists():
        img = add_logo(img)

    filename = OUTPUT_DIR / f"hub_{hub_code}.png"
    img.save(filename, dpi=(300, 300))
    print(f"✓ {filename.name}")


def add_logo(qr_img: Image.Image) -> Image.Image:
    logo = Image.open(LOGO_PATH).convert("RGBA")

    qr_w, qr_h = qr_img.size
    logo_size = int(qr_w * LOGO_SCALE)
    logo = logo.resize((logo_size, logo_size), Image.LANCZOS)

    pos = (
        (qr_w - logo_size) // 2,
        (qr_h - logo_size) // 2,
    )

    qr_img.paste(logo, pos, logo)
    return qr_img


# =========================
# ЗАПУСК
# =========================

if __name__ == "__main__":
    for i in range(START, END + 1):
        hub_code = f"{i:03d}"
        generate_qr(hub_code)