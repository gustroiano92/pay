require('dotenv').config()
const { VueLoaderPlugin } = require('vue-loader')
const webpack = require('webpack')
const path = require('path')

module.exports = {
    mode: 'development',
    entry: './src/main.js',
    output: {
        path: path.resolve(__dirname, 'public/dist'),
        filename: 'bundle.js',
        publicPath: '/dist/'
    },
    devServer: {
        static: {
            directory: path.join(__dirname, 'public'),
            publicPath: '/'
        },
        historyApiFallback: { // 👈 Adicione esta configuração
            index: '/index.html', // Fallback para o index.html
            rewrites: [
                { from: /^\/[0-9a-fA-F]{24}$/, to: '/index.html' } // Rota para IDs (24 caracteres hex)
            ]
        }
    },
    module: {
        rules: [
            { test: /\.vue$/, loader: 'vue-loader' },
            { test: /\.css$/i, use: ['style-loader', 'css-loader'] },
            { test: /\.s[ac]ss$/i, use: ['style-loader', 'css-loader', 'sass-loader'] },
            { test: /\.(png|jpe?g|gif|svg|eot|ttf|woff|woff2)$/i, type: 'asset/resource' }
        ]
    },
    plugins: [
        new VueLoaderPlugin(),
        new webpack.DefinePlugin({
            'import.meta.env': {
                VITE_JSONBIN_MASTER_KEY: JSON.stringify(process.env.VITE_JSONBIN_MASTER_KEY),
                VITE_JSONBIN_ACCESS_KEY: JSON.stringify(process.env.VITE_JSONBIN_ACCESS_KEY)
            }
        })
    ],
    resolve: {
        alias: { '@': path.resolve(__dirname, 'src') },
        extensions: ['.js', '.vue', '.json']
    }
}