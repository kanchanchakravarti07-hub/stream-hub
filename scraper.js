const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    let foundLinks = {};

    page.on('response', async (res) => {
        const url = res.url();
        if (url.includes('.m3u8')) {
            // Logic: Link ko channel name ke saath match karo
            const name = "Live_Stream_" + Math.floor(Math.random() * 1000);
            foundLinks[name] = url;
        }
    });

    await page.goto('https://iptv-eldbert.xyz/iptv/', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 5000)); // 5 sec wait
    
    fs.writeFileSync('channels.json', JSON.stringify(foundLinks, null, 2));
    await browser.close();
    console.log("Updated channels.json successfully!");
})();