import puppeteer from 'puppeteer';
import fs from 'fs';

async function runScraper() {
    const browser = await puppeteer.launch({ 
        headless: "new", 
        args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });
    const page = await browser.newPage();
    
    page.on('response', async (res) => {
        if (res.url().includes('.m3u8')) {
            console.log("🔥 SNATCHED: " + res.url());
            fs.writeFileSync('channels.json', JSON.stringify({ "DSport": res.url() }));
            await browser.close();
            process.exit(0);
        }
    });

    console.log("1. Opening site...");
    await page.goto('https://iptv-eldbert.xyz/', { waitUntil: 'networkidle2' });

    // Step 2: "FIFA World Cup" category par click karo
    console.log("2. Clicking 'FIFA World Cup' category...");
    await page.evaluate(() => {
        const cat = Array.from(document.querySelectorAll('div, button, span'))
                         .find(el => el.innerText && el.innerText.includes('FIFA World Cup'));
        if (cat) cat.click();
    });

    await new Promise(r => setTimeout(r, 5000)); // Load hone ka wait

    // Step 3: "DSports" channel par click karo
    console.log("3. Clicking 'DSports' channel...");
    await page.evaluate(() => {
        const chan = Array.from(document.querySelectorAll('div'))
                          .find(el => el.innerText && el.innerText.toLowerCase().includes('dsports'));
        if (chan) chan.click();
    });

    await new Promise(r => setTimeout(r, 20000)); // Stream load wait
    await browser.close();
}

runScraper();