import puppeteer from 'puppeteer';
import fs from 'fs';

async function runScraper() {
    const browser = await puppeteer.launch({ 
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });
    const page = await browser.newPage();

    // 1. Sniffer (Request capture)
    page.on('response', async (res) => {
        const url = res.url();
        if (url.includes('.m3u8')) {
            console.log("🔥 SNATCHED LINK: " + url);
            fs.writeFileSync('channels.json', JSON.stringify({ "DSport": url }));
            await browser.close();
            process.exit(0);
        }
    });

    console.log("Navigating...");
    await page.goto('https://iptv-eldbert.xyz/iptv/', { waitUntil: 'networkidle2' });

    // 2. Iframe search (Dynamic content ke liye)
    console.log("Searching in iframes...");
    const frames = page.frames();
    let clicked = false;

    for (const frame of frames) {
        const found = await frame.evaluate(() => {
            const el = Array.from(document.querySelectorAll('*')).find(e => e.innerText && e.innerText.toLowerCase().includes('dsport'));
            if (el) {
                el.click();
                return true;
            }
            return false;
        });
        if (found) {
            clicked = true;
            console.log("✅ Found and clicked in an iframe!");
            break;
        }
    }

    if (!clicked) {
        console.log("❌ DSport nahi mila frame mein bhi. Checking main page...");
        // Fallback to main page click
        await page.evaluate(() => {
            const all = Array.from(document.querySelectorAll('*'));
            const target = all.find(e => e.innerText && e.innerText.toLowerCase().includes('dsport'));
            if (target) target.click();
        });
    }

    await new Promise(r => setTimeout(r, 40000)); // Extra wait
    console.log("Timeout.");
    await browser.close();
}

runScraper();