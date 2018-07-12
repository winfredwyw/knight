const chalk = require('chalk')
const webpack = require('webpack')
const webpackConfig = require('../webpack/webpack.config.dev')
const WebpackDevServer = require('webpack-dev-server')
const webpackDevServerConfig = require('../webpack/webpackDevServer.config')

const url = require('url')
const opn = require('opn')
const { clearConsole, checkPort, createDevCompiler, translateHostForWebpackDevServer } = require('../util')
const config = require('../config')
const appName = require('../../package.json').name

if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'development'
}

process.on('unhandledRejection', err => {
    throw err
})

const devPort = parseInt(config.devPort, 10) || 9999
const hostname = config.devHost || '127.0.0.1'

checkPort(devPort).then(port => {
    let address = url.format({
        protocol: 'http:',
        hostname,
        port,
        pathname: `${config.buildPath}/index.html`
    })

    const compiler = createDevCompiler(webpack, webpackConfig, () => {
        opn(address)

        console.log(`You can view ${appName} in the browser ` + chalk.bold('(Note that the development build is not optimized).'))
        console.log()
        console.log(chalk.bold('    on : ') + chalk.cyan(address))
        console.log()
    })

    const devServer = new WebpackDevServer(compiler, webpackDevServerConfig)

    devServer.listen(port, translateHostForWebpackDevServer(hostname), err => {
        if (err) {
            return console.log(err)
        }
        clearConsole()

        console.log(chalk.cyan('Starting the dev server...\n'))
    });

    ['SIGINT', 'SIGTERM'].forEach(sig => {
        process.on(sig, () => {
            devServer.close()
            process.exit()
        })
    })
}).catch(e => {
    e && console.error(e.message || e)
    process.exit(e ? 1 : 0)
})


