import puppeteer from 'puppeteer';
import fs from 'fs';

(async () => {
    // headless: "new" browser ko fast chalayega
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();

    console.log("Navigating to stream...");

    // Yahan wo link daal jahan video play hoti hai
    const targetUrl = 'https://iptv-eldbert.xyz/iptv/embed?id=dsport'; 

    page.on('requestfinished', async (request) => {
        const url = request.url();
        if (url.includes('.m3u8')) {
            console.log(">>> [FOUND STREAM]:", url);
            const data = { "DSport": url };
            fs.writeFileSync('channels.json', JSON.stringify(data, null, 2));
            await browser.close();
            process.exit(0);
        }
    });

    await page.goto(targetUrl, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 20000)); // 20 sec wait
    await browser.close();
})();