const createCustomLogger = require('../config/logger');

const logger = createCustomLogger('websocketHelper.js');
let runningTests = {
    'test1': {
        type: 'selenium',
        output: [
            { timestamp: 1625014800000, message: '200:success - Test completed successfully<br>Next line' },
            { timestamp: 1625014900000, message: 'Info: Checking page elements\nAnother line\r\nYet another line' },
            { timestamp: 1625015000000, message: 'Info: Page loaded correctly' },
        ]
    },
    'test2': {
        type: 'playwright',
        output: [
            { timestamp: 1625015100000, message: '500:failed - Test failed at step 3<br>Failure details' },
            { timestamp: 1625015200000, message: 'Error: Element not found\nAdditional error info' },
        ]
    },
};

exports.initializeWebSocket = (wss) => {
    wss.on('connection', (ws) => {
        ws.send(JSON.stringify(runningTests));
        logger.info('New WebSocket connection established. Sending runningTests');
    });
};

exports.broadcastTests = (wss) => {
    wss.clients.forEach((client) => {
            if (client.readyState === 1) {
                client.send(JSON.stringify(runningTests));
            }
        });
    logger.info('Broadcasted runningTests to all WebSocket clients');
};