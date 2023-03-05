import { parseStringPromise } from 'npm:xml2js';
import cors from '../utils/cors.js';

export default async (ctx) => {
  try {
    const feed = await fetch('https://feeds.feedburner.com/PlaystationblogLatam')
    .then(res => res.text())
    .catch(err => { throw { error: err.response.data.error }; });

    const result = await parseStringPromise(feed);
    const news = result.rss.channel[0].item.map((n) => ({
      title: n.title[0],
      // image: n['media:thumbnail'][0].$.url,
      description: n.description[0],
      link: n.link[0],
    }));

    return Response.json(news, {
      status: 200,
      headers: {
        ...cors,
        'Cache-Control': 'public, max-age=0, s-maxage=86400, stale-while-revalidate',
      },
    });
  } catch (err) {
    return Response.json({}, {
      status: 200,
      headers: {
        ...cors,
      },
    });
  }
}
