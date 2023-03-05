import cors from '../utils/cors.js';

const API_URI = 'https://api.rawg.io/api/games';
const API_KEY = 'c542e67aec3a4340908f9de9e86038af';

function getGame(game) {
  return fetch(`${API_URI}/${game}?key=${API_KEY}`)
  .then(response => response.json());
}

function getYoutube(game) {
  return fetch(`${API_URI}/${game}/youtube?key=${API_KEY}`)
  .then(response => response.json());
}

export default async (ctx) => {
  try {
    const results = await Promise.all([getGame(ctx.searchParams.game), getYoutube(ctx.searchParams.game)]);
    const game = results[0];
    const youtube = results[1];

    const metacritic = game.metacritic_platforms.find(
      critic => ['playstation5', 'playstatio4'].includes(critic.platform.slug)
    );

    return Response.json({
      full: game.clip?.clips.full,
      playlist: youtube?.results.map((video) => video.external_id),
      metacritic: {
        url: metacritic?.url,
        score: metacritic?.metascore,
      },
    }, {
      status: 200,
      headers: {
        ...cors,
        'Cache-Control': 'public, max-age=0, s-maxage=86400, stale-while-revalidate',
      },
    });
  } catch(err) {
    return Response.json({}, {
      status: 200,
      headers: {
        ...cors,
      },
    });
  }
}
