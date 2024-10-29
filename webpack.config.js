const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';

  return {
    entry: './src/js/app.js',  
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'bundle.js',
    },
    mode: isProduction ? 'production' : 'development',
    devtool: isProduction ? false : 'source-map',
    devServer: {
      static: path.join(__dirname, 'dist'),
      hot: true,
      open: true,
      proxy: [
        {
          context: ['/api'], 
          target: 'https://web.ics.purdue.edu', 
          changeOrigin: true,  
          secure: false,  
          pathRewrite: { '^/api': '' }, 
        },
      ],
      devMiddleware: {
        writeToDisk: true,  // Write files to disk in development mode
      },
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
            },
          },
        },
        {
          test: /\.(sa|sc|c)ss$/,  // Handles .sass, .scss, and .css files
          use: [
            isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
            'css-loader',
            'sass-loader',
          ],
        },
      ],
    },
    optimization: {
      minimize: isProduction,
      minimizer: isProduction ? [
        '...',  // Keep the default minimizers (including Terser for JS)
        new CssMinimizerPlugin(),  // Add CSS minification
      ]:[],
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: '[name].css',  // Output CSS file in production
      }),
    ],
  };
};
