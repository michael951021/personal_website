"""Render scripts/og/card.html to app/opengraph-image.png (1200x630). Needs playwright + chromium."""
from pathlib import Path
from playwright.sync_api import sync_playwright

root = Path(__file__).resolve().parents[2]
with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={'width': 1200, 'height': 630})
    page.goto((root / 'scripts/og/card.html').as_uri())
    page.wait_for_load_state('networkidle')
    page.evaluate('document.fonts.ready')
    page.locator('.card').screenshot(path=str(root / 'app/opengraph-image.png'))
    browser.close()
