import { Router } from 'acorn';

import games from '@/api/games.js';
import details from '@/api/details.js';
import search from '@/api/search.js';
import news from '@/api/news.js';
import videos from '@/api/videos.js';
import image from '@/api/image.js';

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
