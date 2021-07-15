// mocks are hoisted.
jest.mock('http', () => {
    const listenMock = jest.fn()
    const createServerMock = jest.fn().mockReturnValue({
        listen: listenMock,
    })
    return ({
        createServer: createServerMock,
        listenMock: listenMock, // make this available to the test for a spy.
    })
})
const http = require('http')
const createServerSpy = jest.spyOn(http, 'createServer')
const listenSpy = jest.spyOn(http, 'listenMock')
process.env.HOSTNAME = 'host'
const SOME_DATE = 'Tue May 14 2019 04:01:58 GMT-0700'
// jest
//     .spyOn(global.Date, 'now')
//     .mockImplementationOnce(() =>
//         new Date(SOME_DATE).valueOf()
//     );

const mockDate = new Date(SOME_DATE)
const spy = jest
    .spyOn(global, 'Date')
    .mockImplementation(() => mockDate)

const {handleRequest, handler} = require('../src/server')

describe('Server', () => {
    const SOME_URL = 'url'
    const SOME_HEADERS = 'headers'
    const SOME_REQUEST = {url: SOME_URL, headers: SOME_HEADERS}
    const originalLog = console.log
    const testLog = jest.fn()
    afterEach(() => (console.log = originalLog))
    beforeEach(() => (console.log = testLog))

    test('Free: handleRequest creates response and logs free', async () => {
        const response = {
            setHeader: jest.fn(),
            writeHead: jest.fn(),
            write: jest.fn(),
            end: jest.fn()
        }
        handleRequest(SOME_REQUEST, response)
        expect(response.setHeader).toBeCalled()
        expect(response.writeHead).toBeCalled()
        expect(response.write).toBeCalledTimes(3)
        expect(response.end).toBeCalled()
        expect(testLog).toBeCalled()
        expect(response.write.mock.calls[1][0].slice(0, 16)).toBe('Free Hello World')
        expect(response.write.mock.calls[1][0].includes('Buy the paid version for more information')).toBe(true)
    })

    test('Paid: handleRequest creates response and logs paid', async () => {
        const response = {
            setHeader: jest.fn(),
            writeHead: jest.fn(),
            write: jest.fn(),
            end: jest.fn()
        }
        process.env.CZ_EDITION = 'paid'
        handleRequest(SOME_REQUEST, response)
        expect(response.setHeader).toBeCalled()
        expect(response.writeHead).toBeCalled()
        expect(response.write).toBeCalledTimes(3)
        expect(response.end).toBeCalled()
        expect(testLog).toBeCalled()
        expect(response.write.mock.calls[1][0].slice(0, 16)).toBe('Paid Hello World')
        expect(response.write.mock.calls[1][0].includes('Paid')).toBe(true)
    })

    test('Server Starts on load.', async () => {
        expect(createServerSpy).toBeCalled()
        expect(listenSpy).toBeCalled()
        expect(testLog).toBeCalled()
    })

    test('handler', () => {
        const dateTime = new Date().toString()
        const startTime = new Date()
        handler()
        expect(console.log).toHaveBeenNthCalledWith(1, 'Free Hello World | Running On: host | Version: Version 2.2 | App: echo-server | Edition: free\n' +
            ' Free: Buy the paid version for more information\n' +
            ' | Headers: headers\n' +
            ' | Parameters: url')
        expect(console.log).toHaveBeenNthCalledWith(2, 'Paid Hello World! | Running On: host | Version: Version 2.2 | App: echo-server | Edition: paid\n' +
            ' Paid: Total Requests: 1 | App Uptime: 0 seconds | Log Time: ' + dateTime + '\n' +
            ' | Headers: headers\n' +
            ' | Parameters: url')
        expect(console.log).toHaveBeenNthCalledWith(3, 'Echo Server App Started At:', startTime, '| Running On: ', process.env.HOSTNAME)
    })
})

