const axios = require('axios');

class GSMArenaSearch {
  constructor() {
    this.baseURL = 'https://m.gsmarena.com';
    this.searchEndpoint = '/search-json.php3';
  }

  async search(query) {
    const headers = {
      'accept': '*/*',
      'accept-language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
      'connection': 'keep-alive',
      'cookie': 'connectId={"ttl":86400000,"lastUsed":1750505706179,"lastSynced":1750505706179}; _ga=GA1.1.1815652847.1770900566; panoramaId_expiry=1771505368190; _cc_id=b175263671f87b2fc95ccd5bb3788542; panoramaId=92ee85b36bfd22e1a6f5354a17a216d539385108f2b6f3d4aa2393ff89511e22; __gads=ID=454691c9eeea4b9b:T=1750505666:RT=1770900571:S=ALNI_MYCV1vxo7Yr4QZWI20IdI8qZ5mheQ; __gpi=UID=00001135b3445066:T=1750505666:RT=1770900571:S=ALNI_Ma8sIk86vbvyB2o-P0QR7a1vqqozg; __eoi=ID=450b184841124e7e:T=1770900571:RT=1770900571:S=AA-AfjYS5vuYdkk-TgNCagLprSaR; _ga_WECNNBCHQE=GS2.1.s1770900566$o1$g1$t1770900642$j60$l0$h0; _ga_T41Y7J4EWG=GS2.1.s1770900645$o1$g0$t1770900645$j60$l0$h0; cto_bundle=7oFkjV9kdWN3ZmJZM0hRb1VyeEdVQlNDS283TzBtTkswQ0MyT2tIMzN3VCUyRnliNm5BQWJyUFFpVEhrVDllZXdvZFMlMkIyZUwzZE93QUQ3dFo1U3FzejIzTXNxZzZwOXo4Q1RHR1dkMGZKbEJDZ25PS3VPekZyZXFiOFVPMHRLT3llam5LeVE5WCUyRmlJdFNMVk5tdFFZbyUyRlY2cVIwQSUzRCUzRA',
      'host': 'm.gsmarena.com',
      'referer': 'https://m.gsmarena.com/register.php3',
      'sec-ch-ua': '"Not(A:Brand";v="8", "Chromium";v="144", "Google Chrome";v="144"',
      'sec-ch-ua-mobile': '?1',
      'sec-ch-ua-platform': '"Android"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
      'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36'
    };

    const params = {
      sSearch: query
    };

    const response = await axios.get(`${this.baseURL}${this.searchEndpoint}`, { 
      headers, 
      params 
    });
    
    return response.data;
  }
}

(async () => {
  const gsm = new GSMArenaSearch();
  const result = await gsm.search('infinix hot 50');
  console.log(JSON.stringify(result, null, 2));
})();
