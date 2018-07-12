const webpack = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const ManifestPlugin = require('webpack-manifest-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const config = require('../config')
const webpackBaseConfig = require('./webpack.config')
const { resolve } = require('../util')

module.exports = {
    mode: 'production',
    bail: true,
    devtool: 'source-map',
    entry: webpackBaseConfig.entry,
    output: Object.assign(webpackBaseConfig.output, {
        filename: '[name].min.js'
    }),
    resolve: webpackBaseConfig.resolve,
    module: (function(baseModule) {
        let rules = baseModule.rules[0]['oneOf']
        let cssRule = rules.filter(r => /css/.test((r.test || '').toString()))[0]
        delete cssRule.use
        cssRule.loader = ExtractTextPlugin.extract({
            fallback: require.resolve('style-loader'),
            use: [
                {
                    loader: require.resolve('css-loader'),
                    options: {
                        sourceMap: true,
                        importLoaders: 1,
                        minimize: true
                    }
                },
                {
                    loader: require.resolve('postcss-loader'),
                    options: {
                        ident: 'postcss',
                        sourceMap: true,
                        plugins: () => [
                            require('postcss-import')(),
                            require('postcss-nested')(),
                            require('postcss-cssnext')({
                                browsers: ['> 0%'],
                                features: {
                                    nesting: false
                                }
                            }),
                            require('postcss-auto-imgmq')()
                        ]
                    }
                }
            ]
        })
        return baseModule
    })(webpackBaseConfig.module),
    plugins: [
        new HtmlWebpackPlugin({
            inject: true,
            template: resolve(config.template),
            chunksSortMode: 'dependency',
            minify: {
                removeComments: true
            }
        }),
        new ExtractTextPlugin({
            filename: '[name].min.css'
        }),
        new ManifestPlugin({
            fileName: 'manifest.json'
        }),
        new webpack.DefinePlugin({
            __PROD__: true
        })
    ].concat(webpackBaseConfig.plugins),
    optimization: {
        minimizer: [
            new UglifyJsPlugin({
                parallel: true,
                sourceMap: true,
                uglifyOptions: {
                    compress: {
                        warnings: false,
                        comparisons: false
                    },
                    output: {
                        comments: false,
                        ascii_only: true
                    }
                }
            })
        ]
    }
}