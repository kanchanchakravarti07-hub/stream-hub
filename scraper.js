import puppeteer from 'puppeteer';
import fs from 'fs';

async function runScraper() {
    const browser = await puppeteer.launch({ 
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });
    const page = await browser.newPage();
    
    // Sniffer: Request sniff karke m3u8 link capture karega
    page.on('response', async (res) => {
        const url = res.url();
        if (url.includes('.m3u8')) {
            console.log("🔥 SNATCHED LINK: " + url);
            fs.writeFileSync('channels.json', JSON.stringify({ "DSport": url }));
            await browser.close();
            process.exit(0);
        }
    });

    console.log("1. Navigating...");
    await page.goto('https://iptv-eldbert.xyz/iptv/', { waitUntil: 'networkidle2' });

    // DEBUG: Page par kya kya links hain, ye print karo
    const links = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('a')).map(a => a.innerText + " | " + a.href);
    });
    console.log("DEBUG: Links found on page:", JSON.stringify(links, null, 2));

    // CLICK LOGIC: Generic search
    await page.evaluate(() => {
        const allElements = document.querySelectorAll('*'); // Sab kuch scan karo
        for (let el of allElements) {
            if (el.innerText && el.innerText.toLowerCase().includes('dsport')) {
                console.log("Found element with dsport text, clicking...");
                el.click();
                break;
            }
        }
    });

    await new Promise(r => setTimeout(r, 30000));
    console.log("Script timeout reached.");
    await browser.close();
}

runScraper();