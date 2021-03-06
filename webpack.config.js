/* Copyright G. Hemingway, 2018 - All rights reserved */
"use strict";

let path = require("path"),
  webpack = require("webpack");

const UglifyJsPlugin = require('uglifyjs-webpack-plugin');


module.exports = {
  context: path.join(__dirname, "/src/client"),
  entry: [  'regenerator-runtime/runtime', "./main.js"],
  mode: "production",
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "public/js")
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ["babel-loader"]
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      }
    ]
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendor",
          chunks: "all"
        }
      }
    }
  },
  plugins: []
};
