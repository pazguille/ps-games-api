import {
  ImageMagick,
  MagickFormat,
  initializeImageMagick,
} from 'imagemagick';
import cors from 'ps/utils/cors.js';

// https://image.api.playstation.com/vulcan/ap/rnd/202211/1009/r6tgTLr0VYsmGMRmaeVcsxkj.png?w=940&thumb=false
// http://localhost:8081/api/image/vulcan/ap/rnd/202211/1009/r6tgTLr0VYsmGMRmaeVcsxkj.png

await initializeImageMagick();

function modifyImage(imageBuffer, format) {
  return new Promise(resolve => {
    const ib = new Uint8Array(imageBuffer);
    ImageMagick.read(ib, img => {
      img.quality = 70;
      img.write((d) => resolve(d),  format === 'webp' ? MagickFormat.Webp : MagickFormat.Jpg);
    });
  });
};

export default async (ctx) => {
  const path = ctx.params.path;
  const queryString = new URLSearchParams(ctx.searchParams).toString();
  const ps = `https://image.api.playstation.com/${path}?${queryString}`;

  const response = await fetch(ps).then(res => res.arrayBuffer());
  const format = ctx.request.headers.get('accept').includes('image/webp') ? 'webp' : 'jpeg';

  const data = await modifyImage(response, format);

  return new Response(data, {
    status: 200,
    headers: {
      ...cors,
      'Content-Type': `image/${format}`,
      'Content-Length': data.byteLength,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
