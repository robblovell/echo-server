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
const { handleRequest } = require('../server')

describe('Server', () => {
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
        handleRequest({}, response)
        expect(response.setHeader).toBeCalled()
        expect(response.writeHead).toBeCalled()
        expect(response.write).toBeCalledTimes(2)
        expect(response.end).toBeCalled()
        expect(testLog).toBeCalled()
        expect(response.write.mock.calls[0][0].slice(0, 16)).toBe('Free Hello World')
        expect(response.write.mock.calls[0][0].includes('Buy the paid version for more information')).toBe(true)
    })

    test('Paid: handleRequest creates response and logs paid', async () => {
        const response = {
            setHeader: jest.fn(),
            writeHead: jest.fn(),
            write: jest.fn(),
            end: jest.fn()
        }
        process.env.CZ_EDITION = 'paid'
        handleRequest({}, response)
        expect(response.setHeader).toBeCalled()
        expect(response.writeHead).toBeCalled()
        expect(response.write).toBeCalledTimes(2)
        expect(response.end).toBeCalled()
        expect(testLog).toBeCalled()
        expect(response.write.mock.calls[0][0].slice(0, 16)).toBe('Paid Hello World')
        expect(response.write.mock.calls[0][0].includes('Paid')).toBe(true)
    })

    test('Server Starts on load.', async () => {
        expect(createServerSpy).toBeCalled()
        expect(listenSpy).toBeCalled()
        expect(testLog).toBeCalled()
    })
})

