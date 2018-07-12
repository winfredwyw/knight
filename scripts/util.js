const path = require('path')
const chalk = require('chalk')
const inquirer = require('inquirer')
const detectPort = require('detect-port')

const isInteractive = process.stdout.isTTY

const printCompilerMessage = messages => {
    if (messages.errors.length) {
        // cut out with hotDevClient
        // if (messages.errors.length > 1) {
        //     messages.errors.length = 1
        // }

        console.log(chalk.red('Failed to compile.\n'))
        console.log(messages.errors.join('\n\n'))
        return
    }

    if (messages.warnings.length) {
        console.log(chalk.yellow('Compiled with warnings.\n'))
        console.log(messages.warnings.join('\n\n'))
    }
}

const resolve = path_from_dir => {
    path_from_dir.startsWith('/') && (path_from_dir = path_from_dir.substring(1))
    return path.resolve(__dirname, '..', path_from_dir)
}

const clearConsole = () => {
    // TODO clear over develop
    // return
    if (!isInteractive) { return }
    process.stdout.write(process.platform === 'win32' ? '\x1B[2J\x1B[0f' : '\x1B[2J\x1B[3J\x1B[H')
}

const checkPort = port => new Promise((resolve, reject) => {
    detectPort(port).then(_port => {
        if (port === _port) {
            return resolve(port)
        }

        const message = process.platform !== 'win32' && port < 1024
            ? 'Admin permissions are required to run server on a port below 1024.'
            : `Port ${port} is busy.`

        if (isInteractive) {
            const question = {
                type: 'confirm',
                name: 'changePort',
                message: chalk.yellow(message + `\nWould you like to run the app on another port instead ? (${_port})`),
                default: true
            }

            inquirer.prompt(question).then(answer => {
                if (answer.changePort) {
                    resolve(_port)
                } else {
                    reject(null)
                }
            })
        } else {
            reject(new Error(message))
        }
    }).catch(reject)
})

const translateHostForWebpackDevServer = hostContain => hostContain.replace('localhost', '0.0.0.0').replace('127.0.0.1', '0.0.0.0')

const createDevCompiler = (webpack, config, firstCompileCallback) => {
    let compiler
    try {
        compiler = webpack(config)
    } catch (e) {
        console.log(e.message || e)
        process.exit(1)
    }

    let isFirstCompile = true

    // short for "bundle invalidated"
    // doesn't imply any errors
    compiler.hooks['invalid'].tap('cus_invalid', () => {
        clearConsole()
        console.log('Compiling...')
    })

    // whether or not you have warnings or errors
    compiler.hooks['done'].tap('cus_done', stats => {
        clearConsole()

        console.log(stats.toString({
            colors: true,
            assets: true,
            errors: false,
            warnings: false,
            cachedAssets: false,
            children: false,
            excludeAssets: /hot-update/,
            modules: false,
            performance: false,
            entrypoints: false,
            hash: false,
            version: false
        }))

        // TODO prettier webpack message
        let messages = stats.toJson("normal")

        let isSuccessful = !messages.errors.length && !messages.warnings.length

        if (isSuccessful) {
            console.log()
            console.log(chalk.green('Compiled successfully!\n'))

            if (isInteractive && isFirstCompile) {
                isFirstCompile = false
                firstCompileCallback()
            }
        } else {
            printCompilerMessage(messages)
        }

    })

    return compiler
}

const createProCompiler = (webpack, config, compileCallback) => {
    let compiler
    try {
        compiler = webpack(config)
    } catch (e) {
        console.log(e.message || e)
        process.exit(1)
    }

    compiler.run((err, stats) => {
        if (err) {
            return compileCallback(err, null)
        }

        clearConsole()

        console.log(stats.toString({
            colors: true,
            assets: true,
            errors: false,
            warnings: false,
            children: false,
            modules: false,
            performance: true,
            entrypoints: true,
            hash: true,
            version: false
        }))

        let messages = stats.toJson("normal")

        if (!messages.errors.length) {

            if (messages.warnings.length) {
                printCompilerMessage(messages)
            }

            console.log()
            console.log(chalk.green('Compiled successfully!\n'))

            compileCallback(null, messages)
        } else {
            printCompilerMessage(messages)
            compileCallback(new Error('Compiled with errors.'), null)
        }

    })
}

module.exports = {
    resolve,
    clearConsole,
    checkPort,
    createDevCompiler,
    createProCompiler,
    translateHostForWebpackDevServer
}