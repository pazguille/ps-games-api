const axios = require('axios');
const { parseStringPromise } = require('xml2js');

module.exports = async (req, res) => {
  try {
    const feed = await axios.get('https://feeds.feedburner.com/PlaystationblogLatam')
      .then(res => res.data)
      .catch(err => { throw { error: err.response.data.error }; });
    const result = await parseStringPromise(feed)
    const news = result.rss.channel[0].item.map((n) => ({
      title: n.title[0],
      // image: n['media:thumbnail'][0].$.url,
      description: n.description[0],
      link: n.link[0],
    }));

    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=86400, stale-while-revalidate');
    return res.status(200).json(news);
  } catch {
    return res.status(200).json({});
  }
}
