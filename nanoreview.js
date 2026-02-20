// @author Rizki
// @title NanoReview
// @description Search Chipset SmartPhone
// @baseurl https://nanoreview.net/en/soc-list/rating
// @tags search,tools
// @language javascript

const cloudscraper = require('cloudscraper');
const cheerio = require('cheerio');

async function Nanoreview() {
  const html = await cloudscraper.get('https://nanoreview.net/en/soc-list/rating');
  const $ = cheerio.load(html);
  const processors = [];

  $('table.table-list tbody tr').each((i, el) => {
    const tds = $(el).find('td');
    
    const ratingText = $(tds[2]).text().trim().replace(/\s+/g, ' ');
    const ratingMatch = ratingText.match(/(\d+)\s+([A-D][+-]?)/);
    
    const coresText = $(tds[5]).text().trim().replace(/\s+/g, '');
    const coresMatch = coresText.match(/(\d+)(\([^)]+\))?/);

    processors.push({
      rank: $(tds[0]).text().trim(),
      name: $(tds[1]).find('a').text().trim(),
      manufacturer: $(tds[1]).find('.text-gray-small').text().trim(),
      rating: {
        score: ratingMatch ? parseInt(ratingMatch[1]) : null,
        grade: ratingMatch ? ratingMatch[2] : null
      },
      antutu: parseInt($(tds[3]).text().trim()) || null,
      geekbench: {
        single: parseInt($(tds[4]).text().trim().split('/')[0]) || null,
        multi: parseInt($(tds[4]).text().trim().split('/')[1]) || null
      },
      cores: {
        total: coresMatch ? parseInt(coresMatch[1]) : null,
        config: coresMatch && coresMatch[2] ? coresMatch[2] : null
      },
      clock: $(tds[6]).text().trim(),
      gpu: $(tds[7]).text().trim()
    });
  });

  return processors;
}

(async () => {
  const results = await Nanoreview();
  console.log(JSON.stringify(results, null, 2));
})();