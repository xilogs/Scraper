const axios = require('axios');
const crypto = require('crypto');
const cheerio = require('cheerio');

class KuramanimeScraper {
    constructor() {
        this.baseURL = 'https://v14.kuramanime.tel';
    }

    generateSessionId() {
        const timestamp = Date.now();
        return `${timestamp.toString(36)}${crypto.randomBytes(8).toString('hex')}`;
    }

    generateXSRFToken() {
        const iv = crypto.randomBytes(16);
        const value = crypto.randomBytes(32);
        const data = Buffer.concat([iv, value]);
        const mac = crypto.createHmac('sha256', 'base64:yYhVjMq5fC0iZJx3wL9sP8tR6gN2bK4d').update(data).digest();
        
        const payload = {
            iv: iv.toString('base64'),
            value: value.toString('base64'),
            mac: mac.toString('base64')
        };
        
        return Buffer.from(JSON.stringify(payload)).toString('base64');
    }

    generateSessionToken() {
        const iv = crypto.randomBytes(16);
        const value = crypto.randomBytes(64);
        const data = Buffer.concat([iv, value]);
        const mac = crypto.createHmac('sha256', 'base64:9x7T2qN8sK5fR3wJ1pL4hM6vC0iZbY').update(data).digest();
        
        const payload = {
            iv: iv.toString('base64'),
            value: value.toString('base64'),
            mac: mac.toString('base64')
        };
        
        return Buffer.from(JSON.stringify(payload)).toString('base64');
    }

    getHeaders() {
        return {
            'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
            'accept-language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
            'cache-control': 'no-cache',
            'pragma': 'no-cache',
            'referer': `${this.baseURL}/`,
            'sec-ch-ua': '"Not(A:Brand";v="8", "Chromium";v="144", "Google Chrome";v="144"',
            'sec-ch-ua-mobile': '?1',
            'sec-ch-ua-platform': '"Android"',
            'sec-fetch-dest': 'document',
            'sec-fetch-mode': 'navigate',
            'sec-fetch-site': 'same-origin',
            'upgrade-insecure-requests': '1',
            'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36',
            'cookie': `__cflb=${crypto.randomBytes(12).toString('hex')}; _ga_D00EX1436J=GS2.1.${Date.now()}.${Date.now()}; _ga=GA1.1.${Math.floor(Math.random() * 1000000000)}.${Math.floor(Date.now()/1000)}; should_do_galak=show; sel_timezone_v2=Asia/Jakarta; auto_timezone_v2=yes; full_timezone_v2=Waktu Indonesia Barat; short_timezone_v2=WIB; XSRF-TOKEN=${encodeURIComponent(this.generateXSRFToken())}; kuramanime_session=${encodeURIComponent(this.generateSessionToken())}`
        };
    }

    async searchAnime(query, orderBy = 'oldest') {
        const params = new URLSearchParams({
            search: query,
            order_by: orderBy
        });

        const response = await axios.get(`${this.baseURL}/anime`, {
            headers: this.getHeaders(),
            params: params,
            timeout: 10000
        });

        return this.parseSearchHTML(response.data);
    }

    parseSearchHTML(html) {
        const $ = cheerio.load(html);
        const results = {
            anime: []
        };

        $('.filter__gallery').each((i, el) => {
            const linkElement = $(el).find('a');
            if (linkElement.length) {
                const link = linkElement.attr('href');
                const title = linkElement.find('.sidebar-title-h5').text().trim();
                
                if (link && title && link.includes('/anime/')) {
                    const imageElement = linkElement.find('.product__sidebar__view__item');
                    let image = imageElement.data('setbg');
                    
                    const ratingElement = linkElement.find('.actual-anime-3');
                    const rating = parseFloat(ratingElement.text().trim()) || 0;
                    
                    const qualityElement = linkElement.find('.view');
                    const quality = qualityElement.text().trim() || 'HD';
                    
                    const statusElement = linkElement.find('.d-none span');
                    const status = statusElement.text().trim() || 'unknown';
                    
                    results.anime.push({
                        id: this.extractIdFromUrl(link),
                        title: title,
                        url: link,
                        image: image,
                        rating: rating,
                        quality: quality,
                        status: status
                    });
                }
            }
        });

        return results;
    }

    async getAnimeDetail(animeId, slug = '') {
        const url = slug ? 
            `${this.baseURL}/anime/${animeId}/${slug}` : 
            `${this.baseURL}/anime/${animeId}`;
        
        const response = await axios.get(url, {
            headers: this.getHeaders(),
            timeout: 10000
        });

        return this.parseDetailHTML(response.data, animeId);
    }

    parseDetailHTML(html, animeId) {
        const $ = cheerio.load(html);
        
        const detail = {
            id: animeId,
            title: $('.anime__details__title h3').text().trim(),
            japanese_title: $('.anime__details__title span').text().trim(),
            synopsis: $('.anime__details__text p').text().trim(),
            rating: $('.ep i').text().trim() || '0',
            episodes: [],
            genres: [],
            info: {}
        };

        $('.anime__details__widget ul li').each((i, el) => {
            const text = $(el).text().trim();
            const links = $(el).find('a');
            
            if (text.includes('Genre:')) {
                links.each((j, genreEl) => {
                    detail.genres.push($(genreEl).text().trim());
                });
            } else if (text.includes('Status:')) {
                detail.info.status = text.replace('Status:', '').trim();
            } else if (text.includes('Studio:')) {
                detail.info.studio = text.replace('Studio:', '').trim();
            } else if (text.includes('Tipe:')) {
                detail.info.type = text.replace('Tipe:', '').trim();
            } else if (text.includes('Episode:')) {
                detail.info.total_episodes = text.replace('Episode:', '').trim();
            } else if (text.includes('Durasi:')) {
                detail.info.duration = text.replace('Durasi:', '').trim();
            } else if (text.includes('Musim:')) {
                detail.info.season = text.replace('Musim:', '').trim();
            } else if (text.includes('Skor:')) {
                detail.info.score = text.replace('Skor:', '').trim();
            }
        });

        const episodePopover = $('#episodeLists').data('content');
        if (episodePopover) {
            const episodeDoc = cheerio.load(episodePopover);
            episodeDoc('a[href*="/episode/"]').each((i, el) => {
                const episodeUrl = episodeDoc(el).attr('href');
                const episodeNum = episodeDoc(el).text().trim().replace('Ep ', '');
                detail.episodes.push({
                    number: episodeNum,
                    url: episodeUrl
                });
            });
        }

        const tags = [];
        $('.breadcrumb__links__v2__tags a').each((i, el) => {
            const tag = $(el).text().trim().replace(',', '');
            if (tag) tags.push(tag);
        });
        detail.tags = tags;

        return detail;
    }

    extractIdFromUrl(url) {
        const match = url.match(/\/anime\/(\d+)/);
        return match ? parseInt(match[1]) : null;
    }

    extractSlugFromUrl(url) {
        const match = url.match(/\/anime\/\d+\/(.+)/);
        return match ? match[1] : '';
    }
}

(async () => {
    const scraper = new KuramanimeScraper();
    
    const searchResult = await scraper.searchAnime('boruto', 'oldest');
    
    if (searchResult.anime.length > 0) {
        const firstAnime = searchResult.anime[0];
        const slug = scraper.extractSlugFromUrl(firstAnime.url);
        const detailResult = await scraper.getAnimeDetail(firstAnime.id, slug);
        
        const result = {
            search: searchResult,
            detail: detailResult
        };
        
        console.log(JSON.stringify(result, null, 2));
    } else {
        const result = {
            search: searchResult,
            detail: {}
        };
        console.log(JSON.stringify(result, null, 2));
    }
})();
