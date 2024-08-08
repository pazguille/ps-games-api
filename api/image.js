import {
  ImageMagick,
  MagickFormat,
  initialize,
} from 'imagemagick';
import cors from '@/utils/cors.js';


// https://image.api.playstation.com/vulcan/ap/rnd/202211/1009/r6tgTLr0VYsmGMRmaeVcsxkj.png?w=940&thumb=false
// http://localhost:8081/api/image/vulcan/ap/rnd/202211/1009/r6tgTLr0VYsmGMRmaeVcsxkj.png

await initialize();

function modifyImage(imageBuffer, format) {
  return new Promise(resolve => {
    const ib = new Uint8Array(imageBuffer);
    ImageMagick.read(ib, img => {
      img.quality = 70;
      img.write(format === 'webp' ? MagickFormat.Webp : MagickFormat.Jpg, (d) => resolve(d));
    });
  });
};

export default async (ctx) => {
  const path = ctx.params.path;
  const queryString = new URLSearchParams(await ctx.queryParams()).toString();
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
