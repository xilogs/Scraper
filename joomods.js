const axios = require('axios');

class JooMods {
  constructor() {
    this.baseURL = 'https://m.joomods.web.id';
    this.headers = {
      'accept': '*/*',
      'accept-encoding': 'gzip, deflate, br, zstd',
      'accept-language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
      'referer': 'https://m.joomods.web.id/',
      'sec-ch-ua': '"Not(A:Brand";v="8", "Chromium";v="144", "Google Chrome";v="144"',
      'sec-ch-ua-mobile': '?1',
      'sec-ch-ua-platform': '"Android"',
      'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36'
    };
  }

  async searchMusic(query) {
    const response = await axios({
      method: 'GET',
      url: `${this.baseURL}/api/music`,
      headers: this.headers,
      params: {
        alicia: query
      }
    });

    return response.data;
  }

  async getDownloadUrl(soundcloudUrl) {
    const response = await axios({
      method: 'GET',
      url: `${this.baseURL}/api/music`,
      headers: this.headers,
      params: {
        download: soundcloudUrl
      }
    });

    return response.data;
  }

  async searchDownload(query) {
    const searchResult = await this.searchMusic(query);
    
    if (searchResult.status && searchResult.result) {
      const results = await Promise.all(
        searchResult.result.map(async (item) => {
          try {
            const downloadInfo = await this.getDownloadUrl(item.url);
            return {
              ...item,
              download: downloadInfo.status ? downloadInfo.result.download_url : ''
            };
          } catch {
            return {
              ...item,
              download: ''
            };
          }
        })
      );
      
      return {
        status: true,
        creator: searchResult.creator,
        result: results
      };
    }
    
    return searchResult;
  }
}

(async () => {
  const api = new JooMods();
  const result = await api.searchDownload('tabola bale');
  console.log(JSON.stringify(result, null, 2));
})();
