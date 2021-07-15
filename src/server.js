const http = require('http')

let requests = 0
const startTime = new Date()
const host = process.env.HOSTNAME || 'unknown'
const version = process.env.VERSION || 'Version 2.2'

const handleRequest = (request, response) => {
    const czEdition = process.env.CZ_EDITION || 'free'
    const czApp = process.env.CZ_APP || 'echo-server'
    const logMessage = (czEdition === 'paid' ? 'Paid Hello World!' : 'Free Hello World') +
        ' | Running On: ' + host +
        ' | Version: ' + version +
        ' | App: ' + czApp +
        ' | Edition: ' + czEdition + '\n' +
        (czEdition === 'paid' ?
            ' Paid: Total Requests: ' + ++requests +
            ' | App Uptime: ' + ((new Date() - startTime) / 1000) + ' seconds' +
            ' | Log Time: ' + new Date().toString()
            :
            ' Free: Buy the paid version for more information') + '\n' +
            ' | Headers: ' + JSON.stringify(request.headers, null, 2)
            .replace(/[\"]/g,'') + '\n' +
            ' | Parameters: ' + JSON.stringify(request.url, null, 2)
            .replace(/[\"]/g,'')

    response.setHeader('Content-Type', 'text/plain')
    response.writeHead(200)
    response.write(version)
    response.write(logMessage)
    response.write(host)
    response.end(' | v=1')
    console.log(logMessage)
}

const handler = function () {
    console.log('Echo Server App Started At:', startTime, '| Running On: ', host)
}

const www = http.createServer(handleRequest)
www.listen(8080, handler)

module.exports = { handleRequest, handler } // for unit tests.
