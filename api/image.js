const axios = require('axios');
const sharp = require('sharp');

// https://image.api.playstation.com/vulcan/ap/rnd/202211/1009/r6tgTLr0VYsmGMRmaeVcsxkj.png?w=940&thumb=false

module.exports = async (req, res) => {
  const path = req.params.path;
  const queryString = new URLSearchParams(req.query).toString();
  const ps = `https://image.api.playstation.com/${path}?${queryString}`;

  const response = await axios.get(ps, { responseType: 'arraybuffer' });

  const format = req.headers.accept.includes('image/webp') ? 'webp' : 'jpeg';

  const data = await sharp(response.data)
    [format]({ quality: 80 })
    .toBuffer();

  res.header('Content-Type', `image/${format}`);
  res.header('Content-Length', data.length);
  res.header('Cache-Control', 'public, max-age=31536000, immutable');

  return res.status(200).send(data);
};
