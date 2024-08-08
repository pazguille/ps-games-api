import groupBy from './group-by.js';

const API_URL = 'https://web.np.playstation.com/api/graphql/v1/op';
const lists = {
  new: 'e1699f77-77e1-43ca-a296-26d08abacb0f',
  deals: 'dc464929-edee-48a5-bcd3-1e6f5250ae80',
  indies: '4cc217c9-dda4-4959-8e08-2bf893c9acd4',
  ps5: 'd0446d4b-dc9a-4f1e-86ec-651f099c9b29',
  ps4: '30e3fe35-8f2d-4496-95bc-844f56952e3c',
  best: 'e6b96a29-cafc-4a19-b78a-752e853862bb',

  free: '4dfd67ab-4ed7-40b0-a937-a549aece13d0',
  coming: '3bf499d7-7acf-4931-97dd-2667494ee2c9',

  all: '28c9c2b2-cecc-415c-9a08-482a605cb104',
  demos: '95601a70-7564-4771-b305-0283fe3593e4',
  vr: '95239ca7-2dcf-43d9-8d4b-b7672ee9304a',
  vr2: '7b0ad209-dadd-4575-9e51-09ccc803deeb',
};

const sortBy = {
  new: { "name":"conceptReleaseDate", "isAscending":false },
};

export default async function fetchGamesList(list, count, skipitems, store, lang) {
  const q = new URLSearchParams({
    'operationName': 'categoryGridRetrieve',
    'variables': JSON.stringify({"id": lists[list], "pageArgs":{ size: count, offset: skipitems },"sortBy":sortBy[list],"filterBy":[],"facetOptions":[]}),
    'extensions': JSON.stringify({"persistedQuery":{"version":1,"sha256Hash":"4ce7d410a4db2c8b635a48c1dcec375906ff63b19dadd87e073f8fd0c0481d35"}}),
  });

  const result = await fetch(`${API_URL}?${q}`, {
    headers: {
      'x-psn-store-locale-override': `${lang}-${store}`,
      'origin': 'https://store.playstation.com',
      'apollographql-client-name': '@sie-ppr-web-store/app',
      'apollographql-client-version': '@sie-ppr-web-store/app@0.90.0'
    },
  })
  .then(response => response.json())
  .then(response => response.data.categoryGridRetrieve?.products.length > 0 ? response.data.categoryGridRetrieve.products : response.data.categoryGridRetrieve?.concepts)
  .catch(err => { console.log(err); throw { error: err.response }; });

  if (result.length === 0) {
    return [];
  }

  const games = result.map(game => {
    const id = game.products?.length ? game.products[0].id : game.id;
    return {
      // id: game.products ? game.products.map(p => p.id) : game.id,
      id,
      concept: !id.includes('_'),
      title: game.name,
      developer: null,
      publisher: null,
      release_date: null,
      sold_separately: game.storeDisplayClassification === 'FULL_GAME',
      platforms: game.platforms,
      price: game.price ? {
        amount: Number(game.price.basePrice.replace('US$', '')) || undefined,
        deal: Number(game.price.discountedPrice.replace('US$', '')) || undefined,
        off: Number(game.price.discountText?.replace(/(-|%)/gi, '')) || undefined,
      } : null,
      description: null,
      images: groupBy(game.media.map(img => ({ url: img.url, type: img.role.toLowerCase()})), 'type'),
      // images: groupBy(game.media.map(img => ({ url: img.url.replace('https://image.api.playstation.com', 'https://ps-games-api.fly.dev/api/image'), type: img.role.toLowerCase()})), 'type'),
      // images: groupBy(game.media.map(img => ({ url: img.url.replace('https://image.api.playstation.com', 'http://localhost:3031/api/image'), type: img.role.toLowerCase()})), 'type'),
    };
  });

  return games;
};
