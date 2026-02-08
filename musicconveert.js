const axios = require('axios');
const https = require('https');
const cheerio = require('cheerio');

class MusicLinkConverter {
    constructor() {
        this.baseUrl = 'https://musiclinkconverter.com/convert';
        this.httpsAgent = new https.Agent({ rejectUnauthorized: false });
    }

    generateHeaders() {
        return {
            'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
            'accept-language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
            'priority': 'u=0, i',
            'referer': 'https://musiclinkconverter.com/',
            'sec-ch-ua': '"Not(A:Brand";v="8", "Chromium";v="144", "Google Chrome";v="144"',
            'sec-ch-ua-mobile': '?1',
            'sec-ch-ua-platform': '"Android"',
            'sec-fetch-dest': 'document',
            'sec-fetch-mode': 'navigate',
            'sec-fetch-site': 'same-origin',
            'sec-fetch-user': '?1',
            'upgrade-insecure-requests': '1',
            'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36'
        };
    }

    extractDataFromHTML(html) {
        const $ = cheerio.load(html);
        
        const title = $('title').text().split('|')[0].trim();
        const tidalUrl = $('a.card.tidal').attr('href');
        const spotifyUrl = $('a.card.spotify').attr('href');
        const tidalImage = $('a.card.tidal img').attr('src');
        const spotifyImage = $('a.card.spotify img').attr('src');
        
        const artists = [];
        $('p.meta-text').each((i, el) => {
            const text = $(el).text().trim();
            if (text && !text.includes('song') && !text.includes(':')) {
                artists.push(text);
            }
        });

        const durations = [];
        $('time').each((i, el) => {
            durations.push($(el).text().trim());
        });

        return {
            title,
            artists: [...new Set(artists)],
            tidalUrl,
            spotifyUrl,
            tidalImage,
            spotifyImage,
            durations: [...new Set(durations)]
        };
    }

    async convert(spotifyUrl) {
        const headers = this.generateHeaders();
        
        const params = {
            url: spotifyUrl
        };

        const response = await axios.get(this.baseUrl, {
            headers,
            params,
            httpsAgent: this.httpsAgent
        });

        const extractedData = this.extractDataFromHTML(response.data);

        return {
            success: true,
            originalUrl: spotifyUrl,
            ...extractedData
        };
    }
}

(async () => {
    const converter = new MusicLinkConverter();
    const tidalUrl = 'https://tidal.com/browse/track/83104101';
    const spotifyUrl = 'https://open.spotify.com/intl-id/track/1rfofaqEpACxVEHIZBJe6W?si=ce973c00c2984008';
    
    const result = await converter.convert(spotifyUrl);
    console.log(result);
})();
