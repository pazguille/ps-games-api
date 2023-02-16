const axios = require('axios');
const groupBy = require('./group-by');

const API_URL = 'https://web.np.playstation.com/api/graphql/v1/op';
const lists = {
  new: 'e1699f77-77e1-43ca-a296-26d08abacb0f',
  deals: '35027334-375e-423b-b500-0d4d85eff784',
  indies: '8ba4fbfb-79c9-49c3-9933-df364a4fe87e',
  ps5: 'd71e8e6d-0940-4e03-bd02-404fc7d31a31',
  ps4: '85448d87-aa7b-4318-9997-7d25f4d275a4',
  best: 'e6b96a29-cafc-4a19-b78a-752e853862bb',

  free: 'd9930400-c5c7-4a06-a28d-cc74888426dc',
  coming: '0d8b3716-872d-4714-aae1-782e4d17ff31',
  // coming: '82ced94c-ed3f-4d81-9b50-4d4cf1da170b',
  all: '28c9c2b2-cecc-415c-9a08-482a605cb104',
  demos: '95601a70-7564-4771-b305-0283fe3593e4',
  vr: '95239ca7-2dcf-43d9-8d4b-b7672ee9304a',
};

async function fetchGamesList(list, count, skipitems, store, lang) {
  const result = await axios.get(API_URL, {
    params: {
      operationName: 'categoryGridRetrieve',
      variables: {"id": lists[list], "pageArgs":{ size: count, offset: skipitems },"sortBy":null,"filterBy":[],"facetOptions":[]},
      extensions: {"persistedQuery":{"version":1,"sha256Hash":"4ce7d410a4db2c8b635a48c1dcec375906ff63b19dadd87e073f8fd0c0481d35"}},
    },
    headers: {
      'x-psn-store-locale-override': `${lang}-${store}`,
      'origin': 'https://store.playstation.com',
    },
  })
  .then(response => response.data.data.categoryGridRetrieve?.products.length > 0 ? response.data.data.categoryGridRetrieve.products : response.data.data.categoryGridRetrieve?.concepts)
  .catch(err => { throw { error: err.response }; });

  if (result.length === 0) {
    return [];
  }

  const games = result.map(game => {
    return {
      // id: game.products ? game.products.map(p => p.id) : game.id,
      id: game.products ? game.products[0].id : game.id,
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
      images: groupBy(game.media.map(img => ({ url: img.url.replace('https://image.api.playstation.com/vulcan/ap/rnd', 'https://ps-games-api.fly.dev/api/image'), type: img.role.toLowerCase()})), 'type'),
      // images: groupBy(game.media.map(img => ({ url: img.url.replace('https://image.api.playstation.com/vulcan/ap/rnd', 'http://localhost:3031/api/image'), type: img.role.toLowerCase()})), 'type'),
    };
  });

  return games;
};

module.exports = fetchGamesList;
