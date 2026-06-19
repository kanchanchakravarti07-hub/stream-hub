import puppeteer from 'puppeteer';
import fs from 'fs';

async function runScraper() {
    const browser = await puppeteer.launch({ 
        headless: "new", 
        args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });
    const page = await browser.newPage();
    
    // Sniffer: Har response ko track karo
    page.on('response', async (res) => {
        const url = res.url();
        if (url.includes('.m3u8')) {
            console.log("🔥 SNATCHED: " + url);
            fs.writeFileSync('channels.json', JSON.stringify({ "DSport": url }));
            await browser.close();
            process.exit(0);
        }
    });

    console.log("1. Opening site...");
    await page.goto('https://iptv-eldbert.xyz/', { waitUntil: 'networkidle2' });

    // Step 2: FIFA World Cup category (Human-like event dispatch)
    console.log("2. Clicking 'FIFA World Cup' category...");
    await page.evaluate(() => {
        const elements = Array.from(document.querySelectorAll('*'));
        const cat = elements.find(el => el.innerText && el.innerText.includes('FIFA World Cup'));
        if (cat) {
            cat.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        }
    });

    await new Promise(r => setTimeout(r, 7000)); // Load wait

    // Step 3: DSports channel click (Human-like event dispatch)
    console.log("3. Clicking 'DSports' channel...");
    await page.evaluate(() => {
        const elements = Array.from(document.querySelectorAll('*'));
        const chan = elements.find(el => el.innerText && el.innerText.toLowerCase().includes('dsports'));
        if (chan) {
            chan.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
            chan.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
            chan.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        }
    });

    // Step 4: Stream ke liye extra wait
    console.log("Waiting for stream to initiate...");
    await new Promise(r => setTimeout(r, 25000)); 
    
    console.log("Cycle complete.");
    await browser.close();
}

runScraper();