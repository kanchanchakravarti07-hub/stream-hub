import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

(async () => {
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    let foundLinks = {};

    page.on('response', async (res) => {
        const url = res.url();
        if (url.includes('.m3u8')) {
            const name = "Channel_" + Object.keys(foundLinks).length;
            foundLinks[name] = url;
        }
    });

    await page.goto('https://iptv-eldbert.xyz/iptv/', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 5000));
    
    // Sahi path pe file save karo
    fs.writeFileSync(path.join(__dirname, 'channels.json'), JSON.stringify(foundLinks, null, 2));
    await browser.close();
    console.log("Updated channels.json successfully!");
})();