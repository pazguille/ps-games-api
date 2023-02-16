const axios = require('axios');
const groupBy = require('./group-by');
const slugify = require('./slugify');

const API_URL = 'https://web.np.playstation.com/api/graphql/v1/op';

const API_URI_RAWG = 'https://api.rawg.io/api/games';
const API_KEY = 'c542e67aec3a4340908f9de9e86038af';

async function fetchGamesDetail(id, store, lang) {
  try {
    const result = await axios.get(API_URL, {
      params: {
        // operationName: 'productRetrieveForUpsellWithCtas',
        // operationName: 'queryRetrieveTelemetryDataPDPConcept',
        variables: { productId: id },
        extensions: {"persistedQuery":{"version":1,"sha256Hash":"d5b5cd4bdbff9886a426c25df39513e4bf3325b3e0612fbf4a905382123fff56"}},
      },
      headers: {
        'x-psn-store-locale-override': `${lang}-${store}`,
        'origin': 'https://store.playstation.com',
      },
    })
    .then(response => response.data.data.productRetrieve)
    .catch(err => { throw { error: err.response }; });


    const game = result.concept.products.filter(g => g.id === result.id)[0];

    const detail = await axios.get(`${API_URI_RAWG}/${slugify(game.name)}`, {
    // const detail = await axios.get(`${API_URI_RAWG}`, {
      params: {
        key: API_KEY,
        page_size: 1,
        search: game.name,
        parent_platforms: 2, // play 4 & 5
      },
      validateStatus: function (status) {
        return status < 500; // Resolve only if the status code is less than 500
      }
    }).then(response => response.data);
    // }).then(response => response.data.results[0]);

    return {
      id: result.id,
      title: game.name,
      developer: detail?.developers?.length ? detail.developers[0].name : null,
      publisher: detail?.publishers?.length ? detail.publishers[0].name : null,
      release_date: detail?.released,
      sold_separately: game.storeDisplayClassification === 'FULL_GAME',
      platforms: game.platforms,
      price: {
        amount: Number(game.webctas[0].price.basePrice.replace('US$', '')) || undefined,
        deal: Number(game.webctas[0].price.discountedPrice.replace('US$', '')) || undefined,
        off: Number(game.webctas[0].price.discountText?.replace(/(-|%)/gi, '')) || undefined,
      },
      description: detail?.description_raw,
      images: groupBy(game.media.map(img => ({ url: img.url.replace('https://image.api.playstation.com/vulcan/ap/rnd', 'https://ps-games-api.fly.dev/api/image'), type: img.role.toLowerCase()})), 'type'),
      // images: groupBy(game.media.map(img => ({ url: img.url.replace('https://image.api.playstation.com/vulcan/ap/rnd', 'http://localhost:3031/api/image'), type: img.role.toLowerCase()})), 'type'),
    };

  } catch (err) {
    console.log(err);
    return err;
  }
};

module.exports = fetchGamesDetail;
