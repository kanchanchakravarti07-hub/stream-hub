import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

(async () => {
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    let foundLinks = {};

    // Response listener pehle hi start kar do
    page.on('response', async (res) => {
        const url = res.url();
        if (url.includes('.m3u8')) {
            console.log(">>> [FOUND STREAM]:", url);
            foundLinks["DSport"] = url; // Yahan channel ka naam set kar sakte ho
        }
    });

    // 1. Page load karo
    await page.goto('https://iptv-eldbert.xyz/iptv/', { waitUntil: 'networkidle2' });
    
    // 2. Thoda wait karo aur channel element ko click karo 
    // (Yahan 'a[href*="dsport"]' selector use kiya hai, check kar lena ki site pe selector yahi hai)
    try {
        console.log("Clicking channel...");
        await page.waitForSelector('a', { visible: true }); 
        await page.click('a[href*="dsport"]'); // Yahan click hoga
        await new Promise(r => setTimeout(r, 10000)); // 10 second wait for stream to load
    } catch (e) {
        console.log("Channel click nahi hua:", e);
    }
    
    fs.writeFileSync(path.join(__dirname, 'channels.json'), JSON.stringify(foundLinks, null, 2));
    await browser.close();
})();