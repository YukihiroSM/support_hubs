from pathlib import Path

from PIL import Image, ImageDraw

OUTPUT_DIR = Path("output")
OUTPUT_PDF = Path("print_cards.pdf")

# A4 @ 300 DPI
PAGE_SIZE = (2480, 3508)
GRID_COLS = 2
GRID_ROWS = 2
OUTER_MARGIN = 90
GUTTER = 80
LINE_COLOR = (180, 180, 180)
LINE_WIDTH = 2


def chunked(items, size):
    for idx in range(0, len(items), size):
        yield items[idx : idx + size]


def load_card(path: Path, max_size):
    img = Image.open(path).convert("RGB")
    if img.width > max_size[0] or img.height > max_size[1]:
        scale = min(max_size[0] / img.width, max_size[1] / img.height)
        new_size = (int(img.width * scale), int(img.height * scale))
        img = img.resize(new_size, Image.LANCZOS)
    return img


def main():
    images = sorted(OUTPUT_DIR.glob("card_*.png"), key=lambda p: p.name)
    if not images:
        print("No cards found in output/")
        return

    total_gutter_w = GUTTER * (GRID_COLS - 1)
    total_gutter_h = GUTTER * (GRID_ROWS - 1)
    usable_w = PAGE_SIZE[0] - OUTER_MARGIN * 2 - total_gutter_w
    usable_h = PAGE_SIZE[1] - OUTER_MARGIN * 2 - total_gutter_h
    cell_w = usable_w // GRID_COLS
    cell_h = usable_h // GRID_ROWS

    pages = []
    for group in chunked(images, GRID_COLS * GRID_ROWS):
        page = Image.new("RGB", PAGE_SIZE, (255, 255, 255))
        draw = ImageDraw.Draw(page)
        for idx, path in enumerate(group):
            row = idx // GRID_COLS
            col = idx % GRID_COLS
            card = load_card(path, (cell_w, cell_h))
            offset_x = (
                OUTER_MARGIN
                + col * (cell_w + GUTTER)
                + (cell_w - card.width) // 2
            )
            offset_y = (
                OUTER_MARGIN
                + row * (cell_h + GUTTER)
                + (cell_h - card.height) // 2
            )
            page.paste(card, (offset_x, offset_y))
        # Cut lines between cells for easier trimming.
        for col in range(1, GRID_COLS):
            x = OUTER_MARGIN + col * cell_w + (col - 1) * GUTTER + GUTTER // 2
            draw.line(
                [(x, OUTER_MARGIN), (x, PAGE_SIZE[1] - OUTER_MARGIN)],
                fill=LINE_COLOR,
                width=LINE_WIDTH,
            )
        for row in range(1, GRID_ROWS):
            y = OUTER_MARGIN + row * cell_h + (row - 1) * GUTTER + GUTTER // 2
            draw.line(
                [(OUTER_MARGIN, y), (PAGE_SIZE[0] - OUTER_MARGIN, y)],
                fill=LINE_COLOR,
                width=LINE_WIDTH,
            )
        pages.append(page)

    pages[0].save(
        OUTPUT_PDF,
        "PDF",
        save_all=True,
        append_images=pages[1:],
        resolution=300.0,
    )
    print(f"Saved {OUTPUT_PDF}")


if __name__ == "__main__":
    main()
