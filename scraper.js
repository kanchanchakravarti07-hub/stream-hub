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
            // Link milne par bhi 5 second rukenge taaki file likhi jaye
            await new Promise(r => setTimeout(r, 5000));
            await browser.close();
            process.exit(0);
        }
    });

    console.log("1. Opening site...");
    await page.goto('https://iptv-eldbert.xyz/', { waitUntil: 'networkidle2' });

    // Step 2 & 3: Click with check
    console.log("2. Clicking category & channel...");
    await page.evaluate(() => {
        const all = Array.from(document.querySelectorAll('*'));
        const cat = all.find(e => e.innerText && e.innerText.includes('FIFA World Cup'));
        if (cat) cat.click();
    });
    
    await new Promise(r => setTimeout(r, 5000));

    await page.evaluate(() => {
        const all = Array.from(document.querySelectorAll('*'));
        const chan = all.find(e => e.innerText && e.innerText.toLowerCase().includes('dsports'));
        if (chan) chan.click();
    });

    // Step 4: Yahan "Wait for Video Player" add kar rahe hain
    console.log("Waiting for video player to initialize...");
    try {
        // Website ka video tag '#v' ya 'video' hone ka wait karenge
        await page.waitForSelector('video', { timeout: 40000 });
        console.log("Video player element found! Sniffing link...");
    } catch (e) {
        console.log("Video player not found, trying anyway...");
    }

    await new Promise(r => setTimeout(r, 30000)); // Total 70s ka time mila
    console.log("Cycle complete.");
    await browser.close();
}

runScraper();

