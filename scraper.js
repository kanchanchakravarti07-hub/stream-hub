import puppeteer from 'puppeteer';
import fs from 'fs';

(async () => {
    const browser = await puppeteer.launch({ 
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });
    const page = await browser.newPage();
    
    // 1. Request Listener: Jaise hi .m3u8 link dikhe, grab kar lo
    page.on('request', (req) => {
        const url = req.url();
        if (url.includes('.m3u8')) {
            console.log(">>> [SNATCHED FROM ELDBERT]:", url);
            fs.writeFileSync('channels.json', JSON.stringify({ "DSport": url }));
            browser.close();
            process.exit(0);
        }
    });

    // 2. Page par jao
    await page.goto('https://iptv-eldbert.xyz/iptv/', { waitUntil: 'networkidle2' });

    // 3. DSport link par click simulation
    // Inspect karke dekha hai ki link text "DSports" ya "DSport" hota hai
    await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a'));
        const target = links.find(el => el.innerText.toLowerCase().includes('dsport'));
        if (target) target.click();
    });

    console.log("Waiting for stream to initiate...");
    await new Promise(r => setTimeout(r, 20000)); // 20 seconds wait
    await browser.close();
})();