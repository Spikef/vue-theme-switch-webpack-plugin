process.env.NODE_ENV = 'development';

const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const ThemeSwitchPlugin = require('../../lib');

const customServers = require('./lib/server');
const { resolve, staticPath } = require('./lib/helper');

module.exports = {
  mode: process.env.NODE_ENV,
  entry: {
    app: resolve('src/index.js'),
  },
  output: {
    path: resolve('dist'),
    filename: 'static/js/[name].js',
    publicPath: '/',
  },
  devServer: {
    contentBase: false,
    compress: true,
    hot: true,
    useLocalIp: true,
    disableHostCheck: true,
    host: '0.0.0.0',
    port: 8500,
    stats: 'minimal',
    open: false,
    writeToDisk: false, // should be false
    before: customServers,
  },
  devtool: 'cheap-module-eval-source-map',
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
          {
            loader: ThemeSwitchPlugin.loader,
            options: {},
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
            },
          },
          {
            loader: 'less-loader',
            options: {
              sourceMap: true,
            },
          },
        ],
      },
      {
        test: /\.(woff2?|eot|ttf|otf|svg)(\?.*)?$/,
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
    new webpack.HotModuleReplacementPlugin(),
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
  node: false,
};
