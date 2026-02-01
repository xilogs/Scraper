const puppeteer = require('puppeteer');

async function XeCurrency(amount = 1000, from = 'IDR', to = 'USD') {
  const browser = await puppeteer.launch({ 
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  const url = `https://www.xe.com/currencyconverter/convert/?Amount=${amount}&From=${from}&To=${to}`;

    await page.goto(url, { 
      waitUntil: 'domcontentloaded',
      timeout: 60000 
    });
    
    await page.waitForSelector('span.amount-input', { timeout: 5000 });
    
    const result = await page.evaluate(() => {
      const title = document.querySelector('h1')?.textContent?.trim() || '';
      const fromAmount = document.querySelector('span.amount-input')?.textContent?.trim() || '';
      const toAmount = document.querySelectorAll('span.amount-input')[1]?.textContent?.trim() || '';
      const rateText = document.querySelector('p.text-lg.font-semibold')?.textContent?.trim() || '';
      const timestamp = document.querySelector('p.text-sm.text-xe-neutral-800')?.textContent?.trim() || '';
      
      return {
        title,
        conversion: `${fromAmount} - ${toAmount}`,
        rate: rateText,
        timestamp
      };
    });
    
    await browser.close();
    return result;
}

(async () => {
    const data = await XeCurrency(10000, 'IDR', 'USD');
    console.log(JSON.stringify(data, null, 2));
})();
