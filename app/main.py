from pathlib import Path

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from app.hubs import HUBS, get_hub

BASE_DIR = Path(__file__).resolve().parent
STATIC_DIR = BASE_DIR / "static"
TEMPLATES_DIR = BASE_DIR / "templates"
SITE_THEME = "christmas"

app = FastAPI(
    title="RIY Support Hubs",
    docs_url=None,
    redoc_url=None,
    openapi_url=None,
)

app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")
templates = Jinja2Templates(directory=str(TEMPLATES_DIR))

@app.middleware("http")
async def disable_cache(request: Request, call_next):
    response = await call_next(request)
    response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    return response


def build_body_class(*classes: str) -> str:
    return " ".join(cls for cls in classes if cls)


@app.get("/", response_class=HTMLResponse)
def root(request: Request) -> HTMLResponse:
    return templates.TemplateResponse(
        "index.html",
        {
            "request": request,
            "title": "Хаби підтримки · РІЙ",
            "hubs": HUBS,
            "site_theme": SITE_THEME,
            "body_class": build_body_class(f"theme-{SITE_THEME}" if SITE_THEME else ""),
            "brand_label": "Хаби підтримки · РІЙ",
        },
    )


@app.get("/hub/{page_id}", response_class=HTMLResponse)
def page(page_id: str, request: Request) -> HTMLResponse:
    hub = get_hub(page_id)
    if not hub:
        raise HTTPException(status_code=404, detail="Hub not found")
    template_name = hub.get("template", "hub.html")
    return templates.TemplateResponse(
        template_name,
        {
            "request": request,
            "title": hub["title"],
            "hub": hub,
            "site_theme": SITE_THEME,
            "body_class": build_body_class(
                f"theme-{SITE_THEME}" if SITE_THEME else "",
                hub.get("theme", ""),
            ),
            "brand_label": hub.get("brand_label"),
        },
    )
