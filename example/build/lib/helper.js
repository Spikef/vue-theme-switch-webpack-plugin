const path = require('path');

exports.resolve = function resolve(...args) {
  return path.resolve(__dirname, '../../', ...args);
};

exports.staticPath = function staticPath(_path) {
  return `static/${_path}`;
};
