const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const settings = require('./settings.json');

const nodeEnv = process.env.NODE_ENV || 'development';
const isDeploy = (nodeEnv === 'production');

const sourcePath = path.join(__dirname, './client');
const staticsPath = path.join(__dirname, './static');

const plugins = [
  new webpack.optimize.CommonsChunkPlugin({
    names: 'vendor',
    minChunks: Infinity,
    filename: (isDeploy) ? 'vendor.[hash].js' : 'vendor.js',
  }),
  new webpack.DefinePlugin({
    'process.env': {
      NODE_ENV: JSON.stringify(nodeEnv),
      SETTINGS: JSON.stringify(settings),
    },
  }),
  new webpack.NamedModulesPlugin(),
  new ExtractTextPlugin({
    filename: (isDeploy) ? 'style.[hash].css' : 'style.css',
    disable: false,
    allChunks: true,
  }),
  new HtmlWebpackPlugin({
    title: '',
    template: 'index.ejs',
    favicon: './assets/favicon.ico',
  }),
];

module.exports = {
  context: sourcePath,
  entry: {
    js: './main.jsx',
    vendor: ['react'],
  },
  output: {
    path: staticsPath,
    filename: (isDeploy) ? 'main.[hash].js' : 'main.js',
    publicPath: '/',
  },
  module: {
    rules: [
      {
        test: /\.json$/,
        use: 'json-loader',
      },
      {
        test: /\.(jpe?g|gif|png|ttf|eot|svg|woff|woff2)[\?]?.*$/,
        use: [
          'url-loader?limit=10000&name=graphics/[name].[ext]',
        ],
      },
      {
        test: /\.scss$/,
        exclude: /node_modules/,
        loader: (isDeploy)
          ? ExtractTextPlugin.extract({
            fallback: 'style-loader',
            use: [
              'css-loader?sourceMap',
              'resolve-url-loader',
              'sass-loader?sourceMap',
            ],
          })
          : [
            'style-loader',
            'css-loader?sourceMap',
            'resolve-url-loader',
            'sass-loader?sourceMap',
          ],
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: [
          'babel-loader',
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx', '.scss'],
    modules: [
      path.resolve(__dirname, 'node_modules'),
      sourcePath,
    ],
  },
  devtool: 'source-map',
  plugins: (isDeploy)
    ? [
      ...plugins,
      new webpack.LoaderOptionsPlugin({
        minimize: true,
        debug: false,
      }),
    ]
    : [
      ...plugins,
      new webpack.HotModuleReplacementPlugin(),
    ],
  devServer: {
    contentBase: './client',
    historyApiFallback: true,
    port: 3000,
    compress: isDeploy,
    inline: !isDeploy,
    hot: !isDeploy,
    stats: {
      assets: true,
      children: false,
      chunks: false,
      hash: false,
      modules: false,
      publicPath: true,
      timings: true,
      version: false,
      warnings: true,
      colors: {
        green: '\u001b[32m',
      },
    },
  },
};
