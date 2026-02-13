const axios = require('axios');
const crypto = require('crypto');

class YouTubeDownloader {
  constructor() {
    this.baseURL = 'https://turboscribe.ai';
    this.session = axios.create({
      baseURL: this.baseURL,
      headers: this.getDefaultHeaders()
    });
    this.cookie = this.generateCookie();
  }

  generateCookie() {
    const snowflake = crypto.randomBytes(16).toString('base64');
    const deviceToken = crypto.randomBytes(16).toString('base64url');
    const accessToken = crypto.randomBytes(16).toString('base64url');
    const sessionSecret = crypto.randomBytes(16).toString('hex');
    const fingerprint = crypto.randomBytes(64).toString('base64').slice(0, 64);
    
    return `webp=1788689759825; avif=1788689759825; snowflake=${encodeURIComponent(snowflake)}; lev=1; time-zone=Asia%2FJakarta; js=1; device-token=${deviceToken}; FPID=FPID2.2.${crypto.randomBytes(16).toString('base64url')}.${Date.now()}; i18n-activated-languages=id%2Cen; FPAU=1.1.${Math.floor(Math.random()*1000000)}.${Date.now()}; access-token=${accessToken}; session-secret=${sessionSecret}; fingerprint=${fingerprint}`;
  }

  getDefaultHeaders() {
    return {
      'accept': '*/*',
      'accept-language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
      'content-type': 'application/json',
      'origin': 'https://turboscribe.ai',
      'priority': 'u=1, i',
      'sec-ch-ua': '"Not(A:Brand";v="8", "Chromium";v="144", "Google Chrome";v="144"',
      'sec-ch-ua-mobile': '?1',
      'sec-ch-ua-platform': '"Android"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
      'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36',
      'x-lev-xhr': '1',
      'x-turbolinks-loaded': 'true'
    };
  }

  async getMp4(youtubeUrl) {
    const headers = {
      ...this.getDefaultHeaders(),
      'referer': 'https://turboscribe.ai/id/downloader/youtube/mp4'
    };

    const response = await this.session.post('/_htmx/NCN20gAEkZMBzQPXkQc', {
      url: youtubeUrl
    }, {
      headers: {
        ...headers,
        'cookie': this.cookie
      }
    });

    const html = response.data;
    
    const thumbnailMatch = html.match(/<img src="([^"]+)"[^>]*class="[^"]*object-cover[^"]*"/);
    const titleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/);
    
    const videoFormats = [];
    const videoRegex = /<a href="(https:\/\/rr[^"]+?)"[^>]*>[\s\S]*?<div>([^<]+)\.mp4<\/div>[\s\S]*?<span>([0-9]+x[0-9]+)<\/span>[\s\S]*?<span>([0-9,]+(?:\.\d+)?)\s*MB<\/span>[\s\S]*?<\/a>/g;
    
    let match;
    while ((match = videoRegex.exec(html)) !== null) {
      videoFormats.push({
        url: match[1].replace(/&amp;/g, '&'),
        title: match[2].trim(),
        format: 'mp4',
        resolution: match[3],
        size: match[4].replace(',', '.'),
        quality: match[3],
        extension: 'mp4',
        fullname: `${match[2].trim()}.mp4`
      });
    }

    return {
      videoTitle: titleMatch ? titleMatch[1].trim() : null,
      thumbnail: thumbnailMatch ? thumbnailMatch[1] : null,
      formats: videoFormats
    };
  }

  async getMp3(youtubeUrl) {
    const headers = {
      ...this.getDefaultHeaders(),
      'referer': 'https://turboscribe.ai/id/downloader/youtube/mp3/free'
    };

    const response = await this.session.post('/_htmx/NCN20gAEkZMBzQPXkQc', {
      url: youtubeUrl
    }, {
      headers: {
        ...headers,
        'cookie': this.cookie
      }
    });

    const html = response.data;
    
    const thumbnailMatch = html.match(/<img src="([^"]+)"[^>]*class="[^"]*object-cover[^"]*"/);
    const titleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/);
    
    const audioFormats = [];
    const audioRegex = /<a href="(https:\/\/rr[^"]+?)"[^>]*>[\s\S]*?<div>([^<]+)\.(m4a|webm)<\/div>[\s\S]*?<span>([0-9,]+(?:\.\d+)?)\s*MB<\/span>[\s\S]*?<span>Audio<\/span>[\s\S]*?<\/a>/g;
    
    let match;
    while ((match = audioRegex.exec(html)) !== null) {
      audioFormats.push({
        url: match[1].replace(/&amp;/g, '&'),
        title: match[2].trim(),
        format: match[3] === 'm4a' ? 'm4a' : 'webm',
        extension: match[3],
        size: match[4].replace(',', '.'),
        bitrate: match[3] === 'm4a' ? '128kbps' : '160kbps',
        quality: 'audio',
        fullname: `${match[2].trim()}.${match[3]}`
      });
    }

    return {
      videoTitle: titleMatch ? titleMatch[1].trim() : null,
      thumbnail: thumbnailMatch ? thumbnailMatch[1] : null,
      formats: audioFormats
    };
  }

  async getAll(youtubeUrl) {
    const headers = {
      ...this.getDefaultHeaders(),
      'referer': 'https://turboscribe.ai/id/downloader/youtube/mp4'
    };

    const response = await this.session.post('/_htmx/NCN20gAEkZMBzQPXkQc', {
      url: youtubeUrl
    }, {
      headers: {
        ...headers,
        'cookie': this.cookie
      }
    });

    const html = response.data;
    
    const thumbnailMatch = html.match(/<img src="([^"]+)"[^>]*class="[^"]*object-cover[^"]*"/);
    const titleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/);
    
    const allFormats = [];
    const regex = /<a href="(https:\/\/rr[^"]+?)"[^>]*>[\s\S]*?<div>([^<]+)\.(mp4|m4a|webm)<\/div>[\s\S]*?<span>([0-9,]+(?:\.\d+)?)\s*MB<\/span>[\s\S]*?(?:<span>([0-9]+x[0-9]+|Audio)<\/span>)?[\s\S]*?<\/a>/g;
    
    let match;
    while ((match = regex.exec(html)) !== null) {
      const format = {
        url: match[1].replace(/&amp;/g, '&'),
        title: match[2].trim(),
        extension: match[3],
        size: match[4].replace(',', '.'),
        fullname: `${match[2].trim()}.${match[3]}`
      };

      if (match[3] === 'mp4') {
        format.format = 'mp4';
        format.quality = match[5];
        format.resolution = match[5];
      } else {
        format.format = match[3] === 'm4a' ? 'm4a' : 'webm';
        format.quality = 'audio';
        format.bitrate = match[3] === 'm4a' ? '128kbps' : '160kbps';
      }

      allFormats.push(format);
    }

    return {
      videoTitle: titleMatch ? titleMatch[1].trim() : null,
      thumbnail: thumbnailMatch ? thumbnailMatch[1] : null,
      formats: allFormats
    };
  }
}

(async () => {
  const downloader = new YouTubeDownloader();
  const youtubeUrl = 'https://youtu.be/sR0GKgWYyLk?si=Tr3tOjiRGCYmxmqr';

  const dayatMp3 = await downloader.getMp3(youtubeUrl);
  // const dayatMp4 = await downloader.getMp4(youtubeUrl);
  console.log(dayatMp3);
})();
