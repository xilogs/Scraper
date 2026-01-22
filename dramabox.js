const axios = require('axios');
const cheerio = require('cheerio');

async function dramabox(query) {
    const { data: html } = await axios.get('https://www.dramaboxdb.com/in/search', {
        params: {
            searchValue: query
        },
    });

    const $ = cheerio.load(html);

    let result = [];

    $('.SearchBookList_imageItem1Wrap__dvPmc').each((_, v) => {
        const title = $(v).find('a').text().trim();
        const url = 'https://www.dramaboxdb.com' + $(v).find('a').attr('href');
        const image = $(v).find('img').attr('src');

        result.push({
            title,
            url,
            image
        });
    });
    return result;
}

async function episode(url) {
    const { data: html } = await axios.get(url);

    const $ = cheerio.load(html);

    let episodes = [];

    $('.relatedEpisode_listItem__PNXFG').each((_, v) => {
        const style = $(v).attr('style');
        if (style && style.includes('display:none')) {
            return;
        }
        
        const episodeLink = $(v).find('a.relatedEpisode_rightIntro__y7zZA');
        const episodeTitle = episodeLink.find('.relatedEpisode_title__eygbR').text().trim();
        const episodeNumber = episodeLink.find('.relatedEpisode_pageNum__W_ulP').text().trim();
        const episodeUrl = 'https://www.dramaboxdb.com' + episodeLink.attr('href');
        
        episodes.push({
            title: episodeTitle,
            episode: episodeNumber,
            url: episodeUrl
        });
    });
    
    return episodes;
}

// (async () => { 
//     const data = await dramabox('ceo');
//     console.log(data);
//     await new Promise(resolve => setTimeout(resolve, 5000));
//     if (data.length > 0) {
//         const Data = await episode(data[0].url);
//         console.log('\nepisode:', Data);
//     }
// })();

// (async () => {
//     const data = await dramabox('ceo');
//     console.log(data);
// })();

// (async () => {
//     const episodes = await episode('https://www.dramaboxdb.com/in/ep/41000117593_ops-suami-kilatku-ternyata-ceo/595476385_Episode-1');
//     console.log(episodes);
// })();
