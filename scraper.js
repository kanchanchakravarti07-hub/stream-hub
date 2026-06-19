import puppeteer from 'puppeteer';
import fs from 'fs';

async function runScraper() {
    const browser = await puppeteer.launch({ 
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });
    const page = await browser.newPage();
    
    // Sniffer
    page.on('response', async (res) => {
        const url = res.url();
        if (url.includes('.m3u8')) {
            console.log("🔥 SNATCHED LINK: " + url);
            fs.writeFileSync('channels.json', JSON.stringify({ "DSport": url }));
            await browser.close();
            process.exit(0);
        }
    });

    console.log("1. Navigating to index...");
    await page.goto('https://iptv-eldbert.xyz/iptv/', { waitUntil: 'networkidle2' });

    console.log("2. Searching for DSport...");
    const clicked = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a'));
        const target = links.find(el => el.innerText.toLowerCase().includes('dsport'));
        if (target) {
            target.click();
            return true;
        }
        return false;
    });

    if (clicked) {
        console.log("3. Clicked successfully! Waiting for stream...");
    } else {
        console.log("❌ DSport link mila hi nahi!");
    }

    await new Promise(r => setTimeout(r, 30000));
    await browser.close();
}

runScraper();