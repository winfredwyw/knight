const path = require('path')
const config = require('../config')
const { resolve, translateHostForWebpackDevServer } = require('../util')
const apiMocker = require('webpack-api-mocker')
const mocker = path.resolve(__dirname, '../../mock/index.js');
const proxy = require('../../mock/proxy');

module.exports = {
    compress: true,
    disableHostCheck: true,
    clientLogLevel: 'none',
    contentBase: config.publicPath.map(resolve),
    watchContentBase: true,
    // open: true,
    hot: true,
    publicPath: `${config.buildPath}/`,
    progress: true,
    quiet: true,
    watchOptions: {
        // ignored:
    },
    host: translateHostForWebpackDevServer(config.devHost),
    overlay: true,
    historyApiFallback: {
        // when using dots in your path (common with Angular) , may need to use the option
        disableDotRule: true
    },
    proxy: proxy,
    before(app) { 
        apiMocker(app, mocker);
    }
}