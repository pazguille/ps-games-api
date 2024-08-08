import { Router } from 'acorn';

import games from 'ps/api/games.js';
import details from 'ps/api/details.js';
import search from 'ps/api/search.js';
import news from 'ps/api/news.js';
import videos from 'ps/api/videos.js';
import image from 'ps/api/image.js';

const app = new Router();

app.get('/', () => Response.redirect('https://github.com/pazguille/ps-games-api/blob/deno/README.md', 301));
app.get('/favicon.ico', ctx => new Response(null, { status: 204 }));
app.get('/api/games', games);
app.get('/api/details', details);
app.get('/api/search', search);
app.get('/api/news', news);
app.get('/api/videos', videos);
app.get('/api/image/:path*', image);

app.listen({ port: Deno.env.get('PORT') || 8081 });
