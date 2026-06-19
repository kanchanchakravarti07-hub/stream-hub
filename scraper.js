const puppeteer = require('puppeteer');
const fs = require('fs');

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

    console.log("1. Navigating to index...");
    await page.goto('https://iptv-eldbert.xyz/iptv/', { waitUntil: 'networkidle2' });

    console.log("2. Searching for DSport in channel list...");
    const clicked = await page.evaluate(() => {
        // Saare 'a' tags dhoondho
        const links = Array.from(document.querySelectorAll('a'));
        // 'dsport' text wala link dhoondho
        const target = links.find(el => el.innerText.toLowerCase().includes('dsport'));
        
        if (target) {
            target.click();
            return true;
        }
        return false;
    });

    if (clicked) {
        console.log("3. Clicked successfully! Waiting for stream request...");
    } else {
        console.log("❌ DSport link mila hi nahi page par!");
    }

    // Stream capture hone ke liye extra time
    await new Promise(r => setTimeout(r, 30000));
    console.log("Script timeout reached.");
    await browser.close();
}

runScraper();