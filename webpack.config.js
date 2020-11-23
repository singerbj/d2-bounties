const path = require('path');
const HtmlWebPackPlugin = require("html-webpack-plugin");

const isProd = process.env.NODE_ENV === 'production';
const APP_DIR = path.resolve('./src');

module.exports = {
    mode: isProd ? 'production' : 'development',
    entry: {
        main: path.resolve(APP_DIR, 'index.js')
    },
    output: {
        path: path.resolve(__dirname, 'dist/'),
        filename: isProd ? '[name].[contenthash].js' : '[name].js'
    },
    module: {        
        rules: [
            {
                test: /\.(js|jsx)$/,
                include: [
                    path.resolve(__dirname, "src")
                ],
                use: {
                    loader: "babel-loader"
                }
            }
        ]
    },
    devtool: 'source-map',
    devServer: {
        contentBase: path.join(__dirname, 'dist'),
        compress: true,
        port: 9000,
        https: true
    },
    plugins: [
        new HtmlWebPackPlugin({
            filename: "./index.html",
            template: 'index.html'
        })
    ]
};