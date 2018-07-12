const fs = require('fs-extra')
const webpack = require('webpack')
const chalk = require('chalk')
const webpackConfig = require('../webpack/webpack.config.prod')
const config = require('../config')
const { resolve, clearConsole, createProCompiler } = require('../util')

if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'production'
}

process.on('unhandledRejection', err => {
    throw err
})

const targetPath = resolve(config.buildPath)

fs.ensureDirSync(targetPath)
fs.emptyDirSync(targetPath)

clearConsole()
console.log(chalk.cyan('Creating an optimized production build...'))

createProCompiler(webpack, webpackConfig, (err, messages) => {
    if (err) {
        console.error(err.message || err)
        return process.exit(1)
    }

    console.log(`The ${chalk.cyan(config.buildPath)} folder is ready to be deployed.\n`)
})
