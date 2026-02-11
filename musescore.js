const axios = require('axios');
const { zencf } = require('zencf');

class NanomidiScraper {
    constructor() {
        this.baseURL = 'https://api.nanomidi.net';
        this.cfToken = null;
    }

    async generateCFToken() {
        const { token } = await zencf.turnstileMax('https://nanomidi.net/musescore-downloader');
        this.cfToken = token;
        return this.cfToken;
    }

    getHeaders() {
        return {
            'accept': '*/*',
            'accept-language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
            'origin': 'https://nanomidi.net',
            'referer': 'https://nanomidi.net/',
            'sec-ch-ua': '"Not(A:Brand";v="8", "Chromium";v="144", "Google Chrome";v="144"',
            'sec-ch-ua-mobile': '?1',
            'sec-ch-ua-platform': '"Android"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-site',
            'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36'
        };
    }

    async downloadMuseScore(url, type = 'midi', refetch = false) {
        await this.generateCFToken();

        const params = {
            url: url,
            type: type,
            token: this.cfToken,
            refetch: refetch
        };

        const response = await axios.get(`${this.baseURL}/api/musescore-downloader`, {
            headers: this.getHeaders(),
            params: params,
            timeout: 30000
        });

        return response.data;
    }
}

(async () => {
    const scraper = new NanomidiScraper();
    const result = await scraper.downloadMuseScore(
        'https://musescore.com/user/39593079/scores/6977564?share=copy_link',
        'midi',
        false
    );
    console.log(JSON.stringify(result, null, 2));
})();
