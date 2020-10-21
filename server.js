const http = require('http')

let requests = 0
const startTime = new Date()
const host = process.env.HOSTNAME || 'unknown'


const handleRequest = (request, response) => {
    const czEdition = process.env.CZ_EDITION || 'free'
    const czApp = process.env.CZ_APP || 'echo-server'
    const logMessage = (czEdition == 'paid' ? 'Paid Hello World!': 'Free Hello World') +
        ' | Running On: ' + host +
        ' | App: ' + czApp +
        ' | Edition: ' + czEdition +
        (czEdition == 'paid' ?
        ' | Total Requests: ' + ++requests +
        ' | App Uptime: ' + ((new Date() - startTime) / 1000) + ' seconds' +
        ' | Log Time: ' + new Date() +'Paid' : ' | Buy the paid version for more information')

    response.setHeader('Content-Type', 'text/plain')
    response.writeHead(200)
    response.write(logMessage)
    response.write(host)
    response.end(' | v=1')
    console.log(logMessage)
}

const www = http.createServer(handleRequest)
www.listen(8080, function () {
    console.log('Echo Server App Started At:',
        startTime, '| Running On: ', host)
})

exports.handleRequest = handleRequest

