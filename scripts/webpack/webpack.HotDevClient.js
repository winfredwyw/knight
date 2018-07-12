const url = require('url')
const SockJS = require('sockjs-client')
// const stripAnsi = require('strip-ansi')
const stripAnsi = input => {
    let ansiRegex = /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-PRZcf-nqry=><]/g
    return typeof input === 'string' ? input.replace(ansiRegex, '') : input
}

const { protocol, hostname, port } = window.location
const stdout = (method, msg) => {
    if (typeof console === 'undefined' || typeof console[method] !== 'function') { return }
    console[method](msg)
}

let isFirstCompilation = true
let hasCompileErrors = false
let compilationHash = null

const clearConsoleOutput = () => hasCompileErrors && stdout('clear')
const shouldUpdate = () => compilationHash !== __webpack_hash__
const canUpdate = () => module.hot.status() === 'idle'
const handleAvaliableHash = hash => compilationHash = hash

const applyUpdates = handleUpdateSuccess => {
    if (!module.hot) {
        window.location.reload()
        return
    }

    if (!canUpdate() || !shouldUpdate()) { return }

    let handleApplyUpdates = (err, updatedModules) => {
        if (err || !updatedModules) {
            window.location.reload()
            return
        }

        if (typeof handleUpdateSuccess === 'function') {
            handleUpdateSuccess()
        }

        if (shouldUpdate()) {
            applyUpdates()
        }
    }

    // return a Promise instead of invoking a callback
    let result = module.hot.check(true)

    if (result && result.then) {
        result
            .then(updatedModules => handleApplyUpdates(null, updatedModules))
            .catch(err => {
                // aborted because propagation not accepted by index
                // console.error(err)
                handleApplyUpdates(err, null)
            })
    }
}

const connection = new SockJS(url.format({
    protocol,
    hostname,
    port,
    pathname: '/sockjs-node'
}))

connection.onclose = () => {
    stdout('info', 'The development server has disconnected.\nRefresh the page if necessary.')
}

const handleSuccess = withWarnings => {
    withWarnings !== true && clearConsoleOutput()

    let isHot = !isFirstCompilation
    isFirstCompilation = false
    hasCompileErrors = false

    isHot && applyUpdates()
}

const handleWarnings = warnings => {

    if (warnings.length > 5) {
        warnings.length = 5
        stdout('warn', 'There were more wornings in other files but Hidden.\nYou can find a complete log in the terminal.')
    }

    warnings.forEach(w => stdout('warn', stripAnsi(w)))

    handleSuccess(true)
}

const handleErrors = errors => {
    clearConsoleOutput()

    isFirstCompilation = false
    hasCompileErrors = true

    if (errors.length > 1) {
        errors.length = 1
        stdout('warn', 'There were more errors in other files but Hidden.\nYou can find a complete log in the terminal.')
    }

    errors.forEach(e => stdout('error', stripAnsi(e)))
}

connection.onmessage = e => {
    let message = JSON.parse(e.data)

    switch (message.type) {
        case 'hash':
            handleAvaliableHash(message.data)
            break
        case 'ok':
        case 'still-ok':
            handleSuccess()
            break
        case 'content-changed':
            window.location.reload()
            break
        case 'warnings':
            handleWarnings(message.data)
            break
        case 'errors':
            handleErrors(message.data)
            break
        default:
            break
    }
}