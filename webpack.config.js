const path = require('path');
const HtmlWebPackPlugin = require("html-webpack-plugin");

module.exports = (env, argv) => {
    const isProd = argv.mode === 'production';
    const APP_DIR = path.resolve('./src');

    return {
        mode: isProd ? 'production' : 'development',
        entry: {
            mainEntry: path.resolve(APP_DIR, 'index.js')
        },
        output: {
            path: path.resolve(__dirname, '.'),
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
            contentBase: path.join(__dirname, '.'),
            compress: true,
            port: 9000,
            https: true
        },
        plugins: [
            new HtmlWebPackPlugin({
                filename: "./index.html",
                template: 'src/index.html',
                scriptLoading: 'defer'
            })
        ]
    };
};