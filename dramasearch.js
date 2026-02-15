const axios = require('axios');

async function dramasearch() {
  const baseURL = 'https://dramabox.dramabos.my.id';
  const headers = {
    'accept': '*/*',
    'accept-language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
    'origin': baseURL,
    'referer': `${baseURL}/`,
    'sec-ch-ua': '"Not(A:Brand";v="8", "Chromium";v="144", "Google Chrome";v="144"',
    'sec-ch-ua-mobile': '?1',
    'sec-ch-ua-platform': '"Android"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
    'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36'
  };

  async function search(query, lang = 'in') {
    const response = await axios({
      method: 'GET',
      url: `${baseURL}/api/v1/search`,
      headers: headers,
      params: {
        query: query,
        lang: lang
      }
    });

    return response.data;
  }

  return {
    search
  };
}

(async () => {
  const api = await dramasearch();
  const results = await api.search('ceo');
  console.log(JSON.stringify(results, null, 2));
})();
