const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const S3Plugin = require('webpack-s3-plugin');

const settingsLocal = require('./settings-local.json');

const nodeEnv = process.env.NODE_ENV || 'development';
const isDeploy = (nodeEnv === 'production');
const deployTarget = process.env.DEPLOY_TARGET;

const sourcePath = path.join(__dirname, './client');
const staticsPath = path.join(__dirname, './static');
const bucket = (deployTarget === 'STAGING_SITE_URL')
  ? 'STAGING_SITE_BUCKET'
  : 'PRODUCTION_SITE_BUCKET';

var settings = settingsLocal;
if (isDeploy) {
  if (deployTarget === 'STAGING_SITE_URL') {
    settings = require('./settings-stg.json');
  } else if (deployTarget === 'PRODUCTION_SITE_URL') {
    settings = require('./settings-prod-tmp1.json');
  } else {
    throw "Unsupported deploy target: " + deployTarget;
  }
}

console.log({ deployTarget, nodeEnv });

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
    title: 'AI Talent Agent For Developers - Yodas',
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
            fallbackLoader: 'style-loader',
            loader: [
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
      new S3Plugin({
        s3Options: {
          region: 'us-west-2',
        },
        s3UploadOptions: {
          Bucket: bucket,
        },
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
