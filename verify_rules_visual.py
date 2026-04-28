import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        # Open Turkish version
        await page.goto("http://localhost:8000/?lang=tr")
        await page.wait_for_selector(".rules")
        # Scroll to bottom
        await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
        await asyncio.sleep(1)
        await page.screenshot(path="/home/jules/verification/screenshots/turkish_rules_bottom.png", full_page=True)
        await browser.close()

asyncio.run(run())
