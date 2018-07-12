const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const config = require('../config')
const webpackBaseConfig = require('./webpack.config')
const { resolve } = require('../util')

module.exports = {
    mode: 'development',
    devtool: 'cheap-module-source-map',
    entry: [require.resolve('./webpack.HotDevClient')].concat(webpackBaseConfig.entry),
    output: Object.assign(webpackBaseConfig.output, {
        pathinfo: true,
        devtoolModuleFilenameTemplate: info => path.resolve(info.absoluteResourcePath).replace(/\\/g, '/')
    }),
    resolve: webpackBaseConfig.resolve,
    module: webpackBaseConfig.module,
    plugins: [
        new HtmlWebpackPlugin({
            inject: true,
            template: resolve(config.template),
            chunksSortMode: 'dependency'
        }),
        // new webpack.NamedModulesPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.DefinePlugin({
            __PROD__: false
        })
    ].concat(webpackBaseConfig.plugins),
    performance: {
        hints: false
    }
}