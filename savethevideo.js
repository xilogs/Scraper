class SaveTheVideoScraper {
    constructor() {
        this.baseURL = 'https://api.v02.savethevideo.com';
        this.headers = {
            'accept': 'application/json',
            'content-type': 'application/json',
            'origin': 'https://www.savethevideo.com',
            'referer': 'https://www.savethevideo.com/',
            'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36',
            'sec-ch-ua': '"Not(A:Brand";v="8", "Chromium";v="144", "Google Chrome";v="144"',
            'sec-ch-ua-mobile': '?1',
            'sec-ch-ua-platform': '"Android"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-site'
        };
    }

    async extractVideoInfo(url) {
        const response = await fetch(`${this.baseURL}/tasks`, {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify({ 
                type: 'info', 
                url: url 
            })
        });
        
        const data = await response.json();
        
        if (data.state === 'completed' && data.result && data.result.length > 0) {
            return data.result[0];
        }
        
        throw new Error('Failed to extract video information');
    }

    async extractFormats(url) {
        const videoInfo = await this.extractVideoInfo(url);
        return {
            title: videoInfo.title,
            duration: videoInfo.duration_string,
            thumbnail: videoInfo.thumbnail,
            formats: videoInfo.formats.map(format => ({
                url: format.url,
                quality: format.format,
                resolution: format.resolution
            }))
        };
    }
}

(async () => {
    const scraper = new SaveTheVideoScraper();
    const result = await scraper.extractFormats('https://dai.ly/x9zi8s0');
    console.log(result);
})();
