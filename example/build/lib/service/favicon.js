const fs = require('fs');
const path = require('path');

const favicon = fs.readFileSync(path.resolve(__dirname, '../../../src/favicon.ico')); // read file

module.exports = function service(app /* server */) {
  app.get('/favicon.ico', (req, res) => {
    res.status(200);
    res.setHeader('Content-Length', favicon.length);
    res.setHeader('Content-Type', 'image/x-icon');
    res.setHeader('Cache-Control', 'public, max-age=2592000');
    res.setHeader('Expires', new Date(Date.now() + 2592000000).toUTCString());
    res.end(favicon);
  });
};
