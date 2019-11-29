if (process.env.NODE_ENV === 'development') {
  exports.loader = require.resolve('./dev/loader');
  module.exports.inject = require('./dev/inject');
} else {
  module.exports = require('./prod/plugin');
  module.exports.inject = require('./prod/inject');
  module.exports.loader = require.resolve('./prod/loader');
}
