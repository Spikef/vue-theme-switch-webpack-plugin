process.env.NODE_ENV = 'production';

const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');

const ThemeSwitchPlugin = require('../../lib');

const { resolve, staticPath } = require('./lib/helper');

module.exports = {
  mode: process.env.NODE_ENV,
  entry: {
    app: resolve('src/index.js'),
  },
  output: {
    path: resolve('../docs'),
    filename: 'static/js/[name].[hash:8].js',
    libraryTarget: 'umd',
  },
  optimization: {
    minimize: false, // false for test
    // namedModules: true, // true for test
  },
  resolve: {
    extensions: ['.vue', '.js', '.json'],
    mainFields: ['jsnext:main', 'browser', 'main'],
    alias: {
      '@': resolve('example'),
      vue$: 'vue/dist/vue.runtime.esm.js',
    },
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        include: [
          resolve('src'),
        ],
        use: {
          loader: 'vue-loader',
          options: {},
        },
      },
      {
        test: /\.js$/,
        include: [
          resolve('src'),
        ],
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', {
                modules: false,
              }],
            ],
          },
        },
      },
      {
        test: /\.(css|less)$/,
        use: [
          ThemeSwitchPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              sourceMap: false,
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              plugins: [
                require('autoprefixer'),
              ],
            },
          },
          {
            loader: 'less-loader',
            options: {
              sourceMap: false,
            },
          },
        ],
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: staticPath('fonts/[name].[hash:6].[ext]'),
        },
      },
    ],
  },
  plugins: [
    new VueLoaderPlugin(),
    new CleanWebpackPlugin(),
    new ThemeSwitchPlugin({
      filename: 'static/css/[name].[hash:8].css',
      chunkFilename: 'static/css/[name].[contenthash:8].css',
    }),
    new HtmlWebpackPlugin({
      template: resolve('./src/index.html'),
      filename: 'index.html',
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true,
        // more $config:
        // https://github.com/kangax/html-minifier#options-quick-reference
      },
      // necessary to consistently work with multiple chunks via CommonsChunkPlugin
      chunksSortMode: 'dependency',
    }),
    // eslint-disable-next-line new-cap
    new ThemeSwitchPlugin.inject(),
  ],
  stats: 'verbose',
  node: false,
};
