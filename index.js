const express = require('express');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.static('player'));

async function startScraper() {
    console.log("🚀 Launching Headless Snatcher...");
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    page.on('request', (req) => {
        if (req.url().includes('.m3u8')) {
            console.log("🔥 SNATCHED: ", req.url());
            fs.writeFileSync('channels.json', JSON.stringify({ "DSport": req.url() }));
        }
        req.continue();
    });

    try {
        await page.setRequestInterception(true);
        await page.goto('https://iptv-eldbert.xyz/iptv/', { waitUntil: 'networkidle2' });
        
        // Force click DSport
        await page.evaluate(() => {
            const links = Array.from(document.querySelectorAll('a'));
            const target = links.find(el => el.innerText.toLowerCase().includes('dsport'));
            if (target) target.click();
        });

        await new Promise(r => setTimeout(r, 25000));
        console.log("✅ Scraper cycle finished.");
    } catch (e) { console.error("❌ Error:", e.message); }
    await browser.close();
}

// Scraper trigger
setInterval(startScraper, 3600000); 
startScraper();

app.get('/channels', (req, res) => {
    res.sendFile(path.join(__dirname, 'channels.json'));
});

app.listen(process.env.PORT || 3000, () => console.log("🚀 Server Live!"));