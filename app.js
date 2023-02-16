const express = require('express');
const compression = require('compression');
const hpp = require('hpp');

const games = require('./api/games');
const search = require('./api/search');
const news = require('./api/news');
const videos = require('./api/videos');
const image = require('./api/image');
const details = require('./api/details');

const app = express();

app.use(compression());
app.use(hpp());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Credential', 'true');
  next();
});

app.get('/favicon.ico', (req, res) => res.status(204).end());
app.get('/api/games', games);
app.get('/api/details', details);
app.get('/api/search', search);
app.get('/api/news', news);
app.get('/api/videos', videos);
app.get('/api/image/:path(*?)', image);

module.exports = app;
