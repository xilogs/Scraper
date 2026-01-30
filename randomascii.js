const puppeteer = require('puppeteer');

async function scrapeRandomAscii(options = {}) {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    
    await page.setViewport({ width: 1366, height: 768 });
    
    await page.goto('https://onlinetools.com/ascii/generate-random-ascii', {
        waitUntil: 'networkidle2',
        timeout: 30000
    });

    await page.waitForSelector('#tool-output textarea.data', { timeout: 10000 });

    if (options.length) {
        await page.evaluate((length) => {
            const lengthInput = document.querySelector('input[data-index="length"]');
            if (lengthInput) {
                lengthInput.value = length;
                lengthInput.dispatchEvent(new Event('input', { bubbles: true }));
            }
        }, options.length);
    }

    if (options.count) {
        await page.evaluate((count) => {
            const countInput = document.querySelector('input[data-index="count"]');
            if (countInput) {
                countInput.value = count;
                countInput.dispatchEvent(new Event('input', { bubbles: true }));
            }
        }, options.count);
    }

    if (options.charset) {
        await page.evaluate((charset) => {
            const select = document.querySelector('select[data-index="predefined-charset"]');
            if (select) {
                select.value = charset;
                select.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }, options.charset);
    }

    if (options.customCharset) {
        await page.evaluate((customCharset) => {
            const textarea = document.querySelector('textarea[data-index="custom-charset"]');
            if (textarea) {
                textarea.value = customCharset;
                textarea.dispatchEvent(new Event('input', { bubbles: true }));
            }
        }, options.customCharset);
    }

    await new Promise(resolve => setTimeout(resolve, 1000));

    await page.click('#tour-action');
    
    await new Promise(resolve => setTimeout(resolve, 1500));

    const result = await page.evaluate(() => {
        const textarea = document.querySelector('#tool-output textarea.data');
        return textarea ? textarea.value : null;
    });

    const toolInfo = await page.evaluate(() => {
        const title = document.querySelector('h1.text-primary')?.textContent?.trim();
        const description = document.querySelector('p.fs-5.pt-2.text-center')?.textContent?.trim();
        
        return {
            title,
            description
        };
    });

    const currentOptions = await page.evaluate(() => {
        const options = {};
        
        const lengthInput = document.querySelector('input[data-index="length"]');
        if (lengthInput) options.length = lengthInput.value;
        
        const countInput = document.querySelector('input[data-index="count"]');
        if (countInput) options.count = countInput.value;
        
        const charsetSelect = document.querySelector('select[data-index="predefined-charset"]');
        if (charsetSelect) {
            const selectedOption = charsetSelect.options[charsetSelect.selectedIndex];
            options.charset = selectedOption.value;
            options.charsetLabel = selectedOption.label;
        }
        
        const customTextarea = document.querySelector('textarea[data-index="custom-charset"]');
        if (customTextarea) options.customCharset = customTextarea.value;
        
        return options;
    });

    await browser.close();

    return {
        result: result,
        options: currentOptions,
        timestamp: new Date().toISOString()
    };
}

(async () => {
    const data = await scrapeRandomAscii({
        length: 32,
        count: 5,
        charset: 'alphalc',
        customCharset: ''
    });
    console.log(data);
})();
