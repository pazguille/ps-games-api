import Joi from 'joi';
import fetchSearchGames from '@/utils/fetch-search-games.js';
import cors from '@/utils/cors.js';

const schema = Joi.object({
  q: Joi.string().required(),
  lang: Joi.string().default('es'),
  store: Joi.string().default('ar'),
});

export default async (ctx) => {
  const { value: query, error } = schema.validate(ctx.searchParams);

  if (error) {
    return Response.json(error.details.map(err => ({
      param: err.path,
      type: err.type,
      message: err.message,
    })), { status: 400 });
  }

  try {
    const results = await fetchSearchGames(query.q, query.store, query.lang);
    return Response.json(results, {
      status: results.code || 200,
      headers: {
        ...cors,
        'Cache-Control': 'public, max-age=0, s-maxage=7200, stale-while-revalidate',
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
