const path = require('path')
const webpack = require('webpack')
const config = require('../config')
const { resolve } = require('../util')

module.exports = {
    entry: [resolve(config.index)],
    output: {
        path: resolve(config.buildPath),
        filename: '[name].js',
        publicPath: `./`
    },
    resolve: {
        extensions: ['.js', '.jsx', '.json'],
        alias: {
        }
    },
    module: {
        rules: [
            {
                oneOf: [
                    {
                        test: /\.jsx?$/,
                        include: [resolve(config.srcPath), resolve(config.scriptPath)],
                        loader: require.resolve('babel-loader'),
                        options: {
                            cacheDirectory: true
                        }
                    },
                    {
                        test: /\.css$/,
                        use: [
                            require.resolve('style-loader'),
                            {
                                loader: require.resolve('css-loader'),
                                options: {
                                    sourceMap: true,
                                    importLoaders: 1
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
                    },
                    {
                        test: /\.(png|jpe?g|bmp|gif|svg|ico|webp)$/,
                        loader: require.resolve('url-loader'),
                        options: {
                            limit: 2048,
                            name: 'images/[name].[hash:8].[ext]'
                        }
                    },
                    {
                        test: /\.(woff2?|eot|ttf|otf)$/,
                        loader: require.resolve('url-loader'),
                        options: {
                            limit: 2048,
                            name: 'font/[name].[hash:8].[ext]'
                        }
                    },
                    {
                        exclude: [
                            /\.jsx?$/,
                            /\.css$/,
                            /\.(png|jpe?g|bmp|gif|svg|ico|webp)$/,
                            /\.(woff2?|eot|ttf|otf)$/,
                            /\.html$/,
                            /\.json$/,
                            /\.md$/
                        ],
                        loader: require.resolve('file-loader'),
                        options: {
                            name: '[name].[hash:8].[ext]'
                        }
                    }
                ]
            }
        ]
    },
    plugins: [
        // new webpack.DefinePlugin({})
    ]
}