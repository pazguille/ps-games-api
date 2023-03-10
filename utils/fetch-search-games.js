import groupBy from './group-by.js';

const API_URL = 'https://web.np.playstation.com/api/graphql/v1/op';

export default async function fetchSearchGames(query, store, lang) {
  const q = new URLSearchParams({
    operationName: 'getSearchResults',
    variables: JSON.stringify({
      searchTerm: query,
      pageSize: 10,
      pageOffset: 0,
      countryCode: store.toUpperCase(),
      languageCode: lang,
      nextCursor:
      "CEgaTgokYTkwN2M1NGM5NTFhNDFlNDhkNDk4ZGU4ZDg5ZDNhOWUtNzA4EiZzZWFyY2gtcmVsZXZhbmN5LWNvbmNlcHQtZ2FtZS1hbGwtdG9wayIec2VhcmNoLm5vX2V4cGVyaW1lbnQubm9uLjAubm9uKgM5NDk",
    }),
    extensions: JSON.stringify({"persistedQuery":{"version":1,"sha256Hash":"d77d9a513595db8d75fc26019f01066d54c8d0de035a77a559bd687fa1010418"}}),
  });

  return await fetch(`${API_URL}?${q}`, {
    headers: {
      'x-psn-store-locale-override': `${lang}-${store}`,
      'origin': 'https://store.playstation.com',
    },
  })
  .then(response => response.json())
  .then(response => response.data.universalSearch.results)
  .then(data => {
    return data.map(game => {
      return {
        // id: game.products ? game.products.map(p => p.id) : game.id,
        id: game.products ? game.products[0].id : game.id,
        title: game.name,
        developer: null,
        publisher: null,
        release_date: null,
        sold_separately: game.storeDisplayClassification === 'FULL_GAME',
        platforms: game.platforms,
        price: game.price,
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
  })
  .catch(err => { throw { error: err }; });
};
