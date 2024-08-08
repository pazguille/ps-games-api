import Joi from 'joi';
import fetchGamesList from 'ps/utils/fetch-games-list.js';
import fetchGamesDetail from 'ps/utils/fetch-games-detail.js';
import cors from 'ps/utils/cors.js';

const schema = Joi.object({
  list: Joi.string().valid('new', 'deals', 'indies', 'ps5', 'ps4', 'best', 'free', 'coming', 'all', 'demos', 'vr', 'vr2'),
  id: Joi.string(),
  skipitems: Joi.number().default(0),
  count: Joi.number().default(10),
  lang: Joi.string().default('es'),
  store: Joi.string().default('ar'),
}).or('list', 'id');

export default async (ctx) => {
  const { value: query, error } = schema.validate(ctx.searchParams);

  if (error) {
    return Response.json(error.details.map(err => ({
      param: err.path,
      type: err.type,
      message: err.message,
    })), { status: 400 });
  }

  let results = null;

  if (query.list) {
    results = await fetchGamesList(query.list, query.count, query.skipitems, query.store, query.lang);
  }

  if (query.id) {
    results = await fetchGamesDetail(query.id, query.store, query.lang);
  }

  return Response.json(results, {
    status: results.code || 200,
    headers: {
      ...cors,
      'Cache-Control': 'public, max-age=0, s-maxage=7200, stale-while-revalidate',
    },
  });
};
