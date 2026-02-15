const axios = require('axios');
const cheerio = require('cheerio');

class NontonAnimeAPI {
  constructor() {
    this.baseURL = 'https://s9.nontonanimeid.boats';
    this.userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    ];
  }

  getHeaders(customReferer = '') {
    const userAgent = this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
    return {
      'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'accept-language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
      'referer': customReferer || 'https://s9.nontonanimeid.boats/',
      'sec-ch-ua': '"Not(A:Brand";v="8", "Chromium";v="144", "Google Chrome";v="144"',
      'sec-ch-ua-mobile': '?1',
      'sec-ch-ua-platform': '"Android"',
      'sec-fetch-dest': 'document',
      'sec-fetch-mode': 'navigate',
      'sec-fetch-site': 'same-origin',
      'upgrade-insecure-requests': '1',
      'user-agent': userAgent
    };
  }

  generateCookies() {
    const timestamp = Date.now();
    return {
      '_lscache_vary': Math.random().toString(36).substring(2, 34),
      '_ga_S0L4FL6T3J': `GS2.1.s${timestamp}`,
      '_ga': `GA1.2.${Math.floor(Math.random() * 999999999)}.${timestamp}`,
      '_gid': `GA1.2.${Math.floor(Math.random() * 999999999)}.${timestamp}`,
      '_gat_gtag_UA_79646797_8': '1'
    };
  }

  async search(query) {
    const cookies = this.generateCookies();
    const cookieString = Object.entries(cookies)
      .map(([key, value]) => `${key}=${value}`)
      .join('; ');

    const response = await axios({
      method: 'GET',
      url: `${this.baseURL}/`,
      headers: {
        ...this.getHeaders(),
        'cookie': cookieString
      },
      params: { 's': query }
    });

    const $ = cheerio.load(response.data);
    const results = [];

    $('.as-anime-card').each((i, el) => {
      const $el = $(el);
      results.push({
        title: $el.find('.as-anime-title').text().trim(),
        url: $el.attr('href'),
        image: $el.find('img').attr('src'),
        rating: $el.find('.as-rating').text().replace('⭐', '').trim(),
        type: $el.find('.as-type').text().replace('📺', '').trim(),
        season: $el.find('.as-season').text().replace('📅', '').trim(),
        synopsis: $el.find('.as-synopsis').text().trim(),
        genres: $el.find('.as-genre-tag').map((i, g) => $(g).text()).get()
      });
    });

    return results;
  }

  async getDetail(url) {
    const cookies = this.generateCookies();
    const cookieString = Object.entries(cookies)
      .map(([key, value]) => `${key}=${value}`)
      .join('; ');

    const response = await axios({
      method: 'GET',
      url: url,
      headers: {
        ...this.getHeaders('https://s9.nontonanimeid.boats/?s=boruto'),
        'cookie': cookieString
      },
      timeout: 10000
    });

    const $ = cheerio.load(response.data);
    
    const english = $('li:contains("English:")').text().replace('English:', '').trim();
    const synonyms = $('li:contains("Synonyms:")').text().replace('Synonyms:', '').trim();
    const studios = $('li:contains("Studios:")').text().replace('Studios:', '').trim();
    const rating = $('li:contains("Rating:")').text().replace('Rating:', '').trim();
    const popularity = $('li:contains("Popularity:")').text().replace('Popularity:', '').trim();
    const members = $('li:contains("Members:")').text().replace('Members:', '').trim();
    const aired = $('li:contains("Aired:")').text().replace('Aired:', '').trim();
    
    const score = $('.anime-card__score .value').text().trim();
    const type = $('.anime-card__score .type').text().trim();
    
    const genres = [];
    $('.anime-card__genres .genre-tag').each((i, el) => {
      genres.push($(el).text().trim());
    });

    const status = $('.info-item.status-finish').text().trim().replace('·', '').trim();
    const episodes = $('.info-item:contains("Episodes")').text().trim().replace('·', '').trim();
    const duration = $('.info-item:contains("min")').text().trim().replace('·', '').trim();

    const synopsis = $('.synopsis-prose p').text().trim();

    const episodesList = [];
    $('.episode-item').each((i, el) => {
      const $el = $(el);
      episodesList.push({
        title: $el.find('.ep-title').text().trim(),
        url: $el.attr('href'),
        date: $el.find('.ep-date').text().trim()
      });
    });

    const recommendations = [];
    $('.related .as-anime-card').each((i, el) => {
      const $el = $(el);
      recommendations.push({
        title: $el.find('.as-anime-title').text().trim(),
        url: $el.attr('href'),
        image: $el.find('img').attr('src'),
        rating: $el.find('.as-rating').text().replace('⭐', '').trim(),
        type: $el.find('.as-type').text().replace('📺', '').trim(),
        season: $el.find('.as-season').text().replace('📅', '').trim()
      });
    });

    const trailer = $('.trailerbutton').attr('href') || '';

    return {
      title: $('.entry-title').text().replace('Nonton', '').replace('Sub Indo', '').trim(),
      image: $('.anime-card__sidebar img').attr('src'),
      trailer,
      score,
      type,
      english,
      synonyms,
      studios,
      rating,
      popularity,
      members,
      aired,
      genres,
      status,
      episodes,
      duration,
      synopsis,
      episodesList,
      recommendations
    };
  }
}

(async () => {
  const api = new NontonAnimeAPI();
  const results = await api.search('boruto');
  const detail = await api.getDetail(results[0].url);
  console.log(detail);
})();
