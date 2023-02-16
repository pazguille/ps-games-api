const axios = require('axios');

const API_URI = 'https://api.rawg.io/api/games';
const API_KEY = 'c542e67aec3a4340908f9de9e86038af';

// para PS4 PS5 PS4&PS5
module.exports = async (req, res) => {
  try {
    const game = await axios.get(`${API_URI}/${req.query.game}`, { params: {
      key: API_KEY,
      parent_platforms: 2, // play 4 & 5
    }}).then(response => response.data);

    res.header('Cache-Control', 'public, max-age=0, s-maxage=7200, stale-while-revalidate');
    return res.status(200).json(game);
  } catch(err) {
    console.log(err);
    return res.status(200).json({});
  }
}
