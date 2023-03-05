import cors from '../utils/cors.js';

const API_URI = 'https://api.rawg.io/api/games';
const API_KEY = 'c542e67aec3a4340908f9de9e86038af';

// para PS4 PS5 PS4&PS5
export default async (ctx) => {
  try {
    const q = new URLSearchParams({
      key: API_KEY,
      parent_platforms: 2, // play 4 & 5
    });
    const game = await fetch(`${API_URI}/${ctx.searchParams.game}?${q}`)
    .then(response => response.json())

    return Response.json(game, {
      status: 200,
      headers: {
        ...cors,
        'Cache-Control': 'public, max-age=0, s-maxage=7200, stale-while-revalidate',
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
