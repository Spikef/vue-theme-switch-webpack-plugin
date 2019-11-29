const fs = require('fs');
const path = require('path');

module.exports = function center(app, server) {
  const serviceRoot = path.resolve(__dirname, './service');
  const fileList = fs.readdirSync(serviceRoot) || [];

  fileList.forEach((file) => {
    if (/\.js$/.test(file)) {
      const filename = path.join(serviceRoot, file);
      // eslint-disable-next-line import/no-dynamic-require
      const service = require(filename);
      service(app, server);
    }
  });
};
