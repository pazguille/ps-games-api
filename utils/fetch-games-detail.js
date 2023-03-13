import groupBy from './group-by.js';
import slugify from './slugify.js';

const API_URL = 'https://web.np.playstation.com/api/graphql/v1/op';

const API_URI_RAWG = 'https://api.rawg.io/api/games';
const API_KEY = 'c542e67aec3a4340908f9de9e86038af';

export default async function fetchGamesDetail(id, store, lang) {
  try {
    const q = new URLSearchParams({
      // operationName: 'productRetrieveForUpsellWithCtas',
      // operationName: 'queryRetrieveTelemetryDataPDPConcept',
      variables: JSON.stringify({ productId: id }),
      extensions: JSON.stringify({"persistedQuery":{"version":1,"sha256Hash":"d5b5cd4bdbff9886a426c25df39513e4bf3325b3e0612fbf4a905382123fff56"}}),
    });

    const result = await fetch(`${API_URL}?${q}`, {
      headers: {
        'x-psn-store-locale-override': `${lang}-${store}`,
        'origin': 'https://store.playstation.com',
      },
    })
    .then(response => response.json())
    .then(response => response.data.productRetrieve)
    .catch(err => { throw { error: err.response }; });

    const game = result.concept.products.filter(g => g.id === result.id)[0];

    const qdetails = new URLSearchParams({
      key: API_KEY,
      page_size: 1,
      search: game.name,
      parent_platforms: 2, // play 4 & 5
    });

    const detail = await fetch(`${API_URI_RAWG}/${slugify(game.name)}?${qdetails}`)
    .then(response => response.json())
    .then(response => response.data);

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
      images: groupBy(game.media.map(img => ({ url: img.url, type: img.role.toLowerCase()})), 'type'),
      // images: groupBy(game.media.map(img => ({ url: img.url.replace('https://image.api.playstation.com', 'https://ps-games-api.fly.dev/api/image'), type: img.role.toLowerCase()})), 'type'),
      // images: groupBy(game.media.map(img => ({ url: img.url.replace('https://image.api.playstation.com', 'http://localhost:3031/api/image'), type: img.role.toLowerCase()})), 'type'),
    };

  } catch (err) {
    return err;
  }
};
